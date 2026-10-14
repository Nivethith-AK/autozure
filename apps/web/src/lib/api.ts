import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  User,
  Workspace,
  Workflow,
  WorkflowGraph,
  Execution,
  ExecutionLog,
  NodeDefinitionMeta,
  Credential,
  WorkflowTrigger,
} from '@autozure/types';

const isBrowser = typeof window !== 'undefined';
const API_BASE_URL = isBrowser
  ? '/api/v1'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token acquisition deduplication promise
let pendingLoginPromise: Promise<string | null> | null = null;
let pendingRefreshPromise: Promise<string | null> | null = null;

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now() + 10000; // expired or expiring in 10 seconds
  } catch {
    return true;
  }
}

async function getOrFetchToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const existingToken = localStorage.getItem('autozure_token');
  if (existingToken && !isTokenExpired(existingToken)) return existingToken;

  // If token is missing or expired, attempt refresh first if refreshToken exists
  const refreshToken = localStorage.getItem('autozure_refresh_token');
  if (refreshToken) {
    if (!pendingRefreshPromise) {
      pendingRefreshPromise = (async () => {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newTokens = res.data.tokens;
          if (newTokens?.accessToken) {
            localStorage.setItem('autozure_token', newTokens.accessToken);
            localStorage.setItem('autozure_refresh_token', newTokens.refreshToken);
            return newTokens.accessToken as string;
          }
          return null;
        } catch {
          localStorage.removeItem('autozure_token');
          localStorage.removeItem('autozure_refresh_token');
          return null;
        } finally {
          pendingRefreshPromise = null;
        }
      })();
    }
    const refreshed = await pendingRefreshPromise;
    if (refreshed) return refreshed;
  }

  // Fallback to dev/self-hosted auto-login
  if (!pendingLoginPromise) {
    pendingLoginPromise = (async () => {
      try {
        const authRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@autozure.local',
          password: 'password123',
        });
        const token = authRes.data.tokens?.accessToken;
        if (token) {
          localStorage.setItem('autozure_token', token);
          localStorage.setItem('autozure_refresh_token', authRes.data.tokens.refreshToken);
        }
        return token || null;
      } catch (err) {
        console.warn('Auto-login initialization failed:', err);
        return null;
      } finally {
        pendingLoginPromise = null;
      }
    })();
  }
  return pendingLoginPromise;
}

// Request interceptor: attach token & workspaceId
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    let currentWorkspaceId = localStorage.getItem('autozure_workspace_id');
    if (!currentWorkspaceId) {
      currentWorkspaceId = 'ws-default-001';
      localStorage.setItem('autozure_workspace_id', 'ws-default-001');
    }

    if (!config.url?.includes('/auth/')) {
      const token = await getOrFetchToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    config.headers['x-workspace-id'] = currentWorkspaceId;
  }
  return config;
});

// Response interceptor: handle 401 token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('autozure_refresh_token');
      if (refreshToken) {
        if (!pendingRefreshPromise) {
          pendingRefreshPromise = (async () => {
            try {
              const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
              const newTokens = res.data.tokens;
              localStorage.setItem('autozure_token', newTokens.accessToken);
              localStorage.setItem('autozure_refresh_token', newTokens.refreshToken);
              return newTokens.accessToken as string;
            } catch {
              localStorage.removeItem('autozure_token');
              localStorage.removeItem('autozure_refresh_token');
              window.location.href = '/login';
              return null;
            } finally {
              pendingRefreshPromise = null;
            }
          })();
        }

        const newAccessToken = await pendingRefreshPromise;
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),
  logout: () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('autozure_refresh_token') : null;
    return apiClient.post('/auth/logout', { refreshToken }).then((r) => r.data);
  },
};

// --- Workspace API ---
export const workspaceApi = {
  list: () => apiClient.get<Workspace[]>('/workspaces').then((r) => r.data),
  get: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<Workspace>('/workspaces', data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<Workspace>(`/workspaces/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/workspaces/${id}`).then((r) => r.data),
  getMembers: (id: string) => apiClient.get<any[]>(`/workspaces/${id}/members`).then((r) => r.data),
};

// --- Workflow API ---
export const workflowApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<Workflow[]>('/workflows', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<Workflow>(`/workflows/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string; graph?: WorkflowGraph }) =>
    apiClient.post<Workflow>('/workflows', data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string; graph?: WorkflowGraph; status?: string }) =>
    apiClient.patch<Workflow>(`/workflows/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/workflows/${id}`).then((r) => r.data),
  execute: (id: string, data?: Record<string, unknown>) =>
    apiClient.post<{ executionId: string; jobId: string; status: string }>(`/workflows/${id}/execute`, { data }).then((r) => r.data),
  getVersions: (id: string) => apiClient.get<any[]>(`/workflows/${id}/versions`).then((r) => r.data),
  getNodeDefinitions: () => apiClient.get<NodeDefinitionMeta[]>('/workflows/nodes').then((r) => r.data),
};

// --- Execution API ---
export const executionApi = {
  list: (params?: { workflowId?: string; status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<Execution[]>('/executions', { params }).then((r) => r.data),
  get: (id: string) => apiClient.get<Execution>(`/executions/${id}`).then((r) => r.data),
  cancel: (id: string) => apiClient.post<{ cancelled: boolean }>(`/executions/${id}/cancel`).then((r) => r.data),
  logs: (id: string) => apiClient.get<ExecutionLog[]>(`/executions/${id}/logs`).then((r) => r.data),
  stats: () => apiClient.get<{ total: number; successful: number; failed: number; running: number; successRate: number }>('/executions/stats').then((r) => r.data),
};

// --- Credential API ---
export const credentialApi = {
  list: () => apiClient.get<Credential[]>('/credentials').then((r) => r.data),
  create: (data: { name: string; type: string; data: Record<string, string> }) =>
    apiClient.post<Credential>('/credentials', data).then((r) => r.data),
  update: (id: string, data: { name?: string; data?: Record<string, string> }) =>
    apiClient.patch<Credential>(`/credentials/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/credentials/${id}`).then((r) => r.data),
};

// --- Trigger API ---
export const triggerApi = {
  list: (workflowId: string) => apiClient.get<WorkflowTrigger[]>(`/triggers/${workflowId}`).then((r) => r.data),
  createWebhook: (workflowId: string, config: Record<string, unknown>) =>
    apiClient.post<WorkflowTrigger & { webhookUrl: string }>(`/triggers/${workflowId}/webhook`, config).then((r) => r.data),
  createSchedule: (workflowId: string, config: { cron: string; timezone?: string }) =>
    apiClient.post<WorkflowTrigger>(`/triggers/${workflowId}/schedule`, config).then((r) => r.data),
  delete: (triggerId: string) => apiClient.delete(`/triggers/${triggerId}`).then((r) => r.data),
};
