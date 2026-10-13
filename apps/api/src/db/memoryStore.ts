import {
  User,
  Workspace,
  Workflow,
  Execution,
  NodeExecutionResult,
  ExecutionLog,
  Credential,
} from '@autozure/types';
import bcrypt from 'bcryptjs';

export interface StoredUser extends User {
  passwordHash: string;
}

export interface StoredCredential extends Credential {
  encryptedData: string;
  iv: string;
}

class MemoryStore {
  users: Map<string, StoredUser> = new Map();
  refreshTokens: Map<string, { userId: string; token: string; expiresAt: Date }> = new Map();
  workspaces: Map<string, Workspace> = new Map();
  workspaceMembers: Map<string, { workspaceId: string; userId: string; role: string }> = new Map();
  workflows: Map<string, Workflow & { active: boolean }> = new Map();
  workflowVersions: Map<string, any[]> = new Map(); // workflowId -> versions
  executions: Map<string, Execution> = new Map();
  nodeResults: Map<string, NodeExecutionResult[]> = new Map(); // executionId -> results
  logs: Map<string, ExecutionLog[]> = new Map(); // executionId -> logs
  credentials: Map<string, StoredCredential> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultUserId = 'user-admin-default';
    const defaultWorkspaceId = 'ws-default-001';

    // Seed default admin user
    const passwordHash = bcrypt.hashSync('password123', 8);
    this.users.set(defaultUserId, {
      id: defaultUserId,
      email: 'admin@autozure.local',
      name: 'Admin User',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed default workspace
    this.workspaces.set(defaultWorkspaceId, {
      id: defaultWorkspaceId,
      name: 'Default Workspace',
      slug: 'default-workspace',
      ownerId: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.workspaceMembers.set(`${defaultWorkspaceId}:${defaultUserId}`, {
      workspaceId: defaultWorkspaceId,
      userId: defaultUserId,
      role: 'owner',
    });

    // Seed a sample workflow
    const sampleWfId = 'wf-sample-welcome';
    this.workflows.set(sampleWfId, {
      id: sampleWfId,
      workspaceId: defaultWorkspaceId,
      name: 'Welcome & Getting Started Pipeline',
      description: 'A pre-configured demo flow demonstrating triggers, variable setting, and data inspection.',
      status: 'active',
      active: true,
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      graph: {
        nodes: [
          {
            id: 'node-trigger-1',
            type: 'trigger.manual',
            position: { x: 80, y: 200 },
            data: {
              type: 'trigger.manual',
              label: 'Manual Trigger',
              category: 'triggers',
              icon: 'Play',
              color: '#ffffff',
              parameters: {
                data: JSON.stringify({ message: 'Hello from AutoZure!' }),
              },
            },
          },
          {
            id: 'node-var-2',
            type: 'data.setVariable',
            position: { x: 480, y: 200 },
            data: {
              type: 'data.setVariable',
              label: 'Set Parameters',
              category: 'data',
              icon: 'Variable',
              color: '#ffffff',
              parameters: {
                assignments: JSON.stringify({ environment: 'local', status: 'ready', counter: 42 }),
                keepOriginal: true,
              },
            },
          },
          {
            id: 'node-debug-3',
            type: 'util.debug',
            position: { x: 880, y: 200 },
            data: {
              type: 'util.debug',
              label: 'Inspect Output',
              category: 'utils',
              icon: 'Bug',
              color: '#ffffff',
              parameters: {
                label: 'Sample Output Inspection',
              },
            },
          },
        ],
        edges: [
          {
            id: 'edge-1-2',
            source: 'node-trigger-1',
            target: 'node-var-2',
            sourceHandle: 'output',
            targetHandle: 'input',
            type: 'smoothstep',
            animated: true,
          },
          {
            id: 'edge-2-3',
            source: 'node-var-2',
            target: 'node-debug-3',
            sourceHandle: 'output',
            targetHandle: 'input',
            type: 'smoothstep',
            animated: true,
          },
        ],
      },
    });
  }
}

export const memoryStore = new MemoryStore();
