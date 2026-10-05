import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { workspaces, workspaceMembers, users } from '../../db/schema';
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../../middleware/error.middleware';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

export class WorkspaceService {
  async create(userId: string, data: { name: string; description?: string; slug?: string }) {
    const slug = data.slug || generateSlug(data.name) + '-' + Date.now().toString(36);
    
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
    const memberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
      with: { workspace: true },
    });
    return memberships.map(m => ({ ...m.workspace, role: m.role }));
  }

  async getById(workspaceId: string, userId: string) {
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
      with: { workspace: true },
    });
    if (!membership) throw new NotFoundError('Workspace');
    return { ...membership.workspace, role: membership.role };
  }

  async update(workspaceId: string, userId: string, data: { name?: string; description?: string }) {
    await this.assertRole(workspaceId, userId, ['owner', 'admin']);
    const [updated] = await db.update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning();
    if (!updated) throw new NotFoundError('Workspace');
    return updated;
  }

  async delete(workspaceId: string, userId: string) {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    if (!workspace) throw new NotFoundError('Workspace');
    if (workspace.ownerId !== userId) throw new ForbiddenError('Only the owner can delete a workspace');
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  async getMembers(workspaceId: string, userId: string) {
    await this.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    return db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspaceId),
      with: { user: { columns: { id: true, email: true, name: true } } },
    });
  }

  async assertRole(workspaceId: string, userId: string, roles: string[]) {
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
