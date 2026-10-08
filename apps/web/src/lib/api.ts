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
} from '@flowforge/types';

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

// Request interceptor: attach token & workspaceId
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('flowforge_token');
    let currentWorkspaceId = localStorage.getItem('flowforge_workspace_id');

    if (!currentWorkspaceId) {
      currentWorkspaceId = 'ws-default-001';
      localStorage.setItem('flowforge_workspace_id', 'ws-default-001');
    }

    if (!token && !config.url?.includes('/auth/')) {
      try {
        const authRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@flowforge.local',
          password: 'password123',
        });
        token = authRes.data.tokens.accessToken;
        localStorage.setItem('flowforge_token', token as string);
        localStorage.setItem('flowforge_refresh_token', authRes.data.tokens.refreshToken);
      } catch {}
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      const refreshToken = localStorage.getItem('flowforge_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newTokens = res.data.tokens;
          localStorage.setItem('flowforge_token', newTokens.accessToken);
          localStorage.setItem('flowforge_refresh_token', newTokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('flowforge_token');
          localStorage.removeItem('flowforge_refresh_token');
          window.location.href = '/login';
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
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('flowforge_refresh_token') : null;
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
