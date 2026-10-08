import { eq, and } from 'drizzle-orm';
import { db, isDbConnected } from '../../db';
import { memoryStore } from '../../db/memoryStore';
import { workspaces, workspaceMembers, users } from '../../db/schema';
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../../middleware/error.middleware';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

export class WorkspaceService {
  async create(userId: string, data: { name: string; description?: string; slug?: string }) {
    const slug = data.slug || generateSlug(data.name) + '-' + Date.now().toString(36);

    if (!isDbConnected) {
      const existing = Array.from(memoryStore.workspaces.values()).find(w => w.slug === slug);
      if (existing) throw new ConflictError('Workspace slug already taken');

      const id = `ws-${Date.now()}`;
      const workspace: any = {
        id,
        name: data.name,
        slug,
        description: data.description,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.workspaces.set(id, workspace);
      memoryStore.workspaceMembers.set(`${id}:${userId}`, {
        workspaceId: id,
        userId,
        role: 'owner',
      });
      return workspace;
    }

    const existing = await db.query.workspaces.findFirst({ where: eq(workspaces.slug, slug) });
    if (existing) throw new ConflictError('Workspace slug already taken');

    const [workspace] = await db.insert(workspaces).values({
      name: data.name,
      slug,
      description: data.description,
      ownerId: userId,
    }).returning();

    // Add creator as owner
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId,
      role: 'owner',
    });

    return workspace;
  }

  async getByUser(userId: string) {
    if (!isDbConnected) {
      return Array.from(memoryStore.workspaces.values()).map(w => ({
        ...w,
        role: memoryStore.workspaceMembers.get(`${w.id}:${userId}`)?.role || 'owner',
      }));
    }

    const memberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
      with: { workspace: true },
    });
    return memberships.map(m => ({ ...(m.workspace as any), role: m.role }));
  }

  async getById(workspaceId: string, userId: string) {
    if (!isDbConnected) {
      const ws = memoryStore.workspaces.get(workspaceId);
      if (!ws) throw new NotFoundError('Workspace');
      const role = memoryStore.workspaceMembers.get(`${workspaceId}:${userId}`)?.role || 'owner';
      return { ...ws, role };
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
      with: { workspace: true },
    });
    if (!membership) throw new NotFoundError('Workspace');
    return { ...(membership.workspace as any), role: membership.role };
  }

  async update(workspaceId: string, userId: string, data: { name?: string; description?: string }) {
    await this.assertRole(workspaceId, userId, ['owner', 'admin']);
    if (!isDbConnected) {
      const ws = memoryStore.workspaces.get(workspaceId);
      if (!ws) throw new NotFoundError('Workspace');
      const updated = { ...ws, ...data, updatedAt: new Date() };
      memoryStore.workspaces.set(workspaceId, updated);
      return updated;
    }

    const [updated] = await db.update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning();
    if (!updated) throw new NotFoundError('Workspace');
    return updated;
  }

  async delete(workspaceId: string, userId: string) {
    if (!isDbConnected) {
      const ws = memoryStore.workspaces.get(workspaceId);
      if (!ws) throw new NotFoundError('Workspace');
      if (ws.ownerId !== userId) throw new ForbiddenError('Only the owner can delete a workspace');
      memoryStore.workspaces.delete(workspaceId);
      return;
    }

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) throw new NotFoundError('Workspace');
    if (workspace.ownerId !== userId) throw new ForbiddenError('Only the owner can delete a workspace');
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    if (!isDbConnected) {
      return Array.from(memoryStore.workspaceMembers.values())
        .filter(m => m.workspaceId === workspaceId)
        .map(m => ({
          ...m,
          user: memoryStore.users.get(m.userId) || { id: m.userId, email: 'admin@flowforge.local', name: 'Admin' },
        }));
    }

    return db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspaceId),
      with: { user: { columns: { id: true, email: true, name: true } } },
    });
  }

  async assertRole(workspaceId: string, userId: string, roles: string[]) {
    if (!isDbConnected) {
      // In local dev mode without DB, allow default access
      return { workspaceId, userId, role: 'owner' };
    }

    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });
    if (!member || !roles.includes(member.role)) {
      throw new ForbiddenError('Insufficient permissions for this workspace');
    }
    return member;
  }
}

export const workspaceService = new WorkspaceService();
