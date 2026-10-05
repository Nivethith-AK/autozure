import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { credentials } from '../../db/schema';
import { workspaceService } from '../workspaces/workspace.service';
import { encrypt, decrypt } from '../../lib/crypto';
import { NotFoundError } from '../../middleware/error.middleware';

export class CredentialService {
  async create(userId: string, workspaceId: string, data: {
    name: string;
    type: string;
    data: Record<string, string>;
  }) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    const { encryptedData, iv } = encrypt(JSON.stringify(data.data));

    const [cred] = await db.insert(credentials).values({
      workspaceId,
      name: data.name,
      type: data.type,
      encryptedData,
      iv,
      createdBy: userId,
    }).returning({
      id: credentials.id,
      workspaceId: credentials.workspaceId,
      name: credentials.name,
      type: credentials.type,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
    });

    return cred;
  }

  async getAll(userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    return db.query.credentials.findMany({
      where: eq(credentials.workspaceId, workspaceId),
      columns: { encryptedData: false, iv: false },
    });
  }

  async getById(id: string, userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);
    const cred = await db.query.credentials.findFirst({
      where: and(eq(credentials.id, id), eq(credentials.workspaceId, workspaceId)),
    });
    if (!cred) throw new NotFoundError('Credential');
    return cred;
  }

  /** Decrypt and return raw data — only for internal engine use */
  async getDecrypted(id: string, workspaceId: string): Promise<Record<string, string>> {
    const cred = await db.query.credentials.findFirst({
      where: and(eq(credentials.id, id), eq(credentials.workspaceId, workspaceId)),
    });
    if (!cred) throw new NotFoundError('Credential');
    return JSON.parse(decrypt(cred.encryptedData, cred.iv));
  }

  async update(id: string, userId: string, workspaceId: string, data: {
    name?: string;
    data?: Record<string, string>;
  }) {
    await this.getById(id, userId, workspaceId);
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name) updates.name = data.name;
    if (data.data) {
      const { encryptedData, iv } = encrypt(JSON.stringify(data.data));
      updates.encryptedData = encryptedData;
      updates.iv = iv;
    }
    const [updated] = await db.update(credentials)
      .set(updates)
      .where(eq(credentials.id, id))
      .returning({ id: credentials.id, name: credentials.name, type: credentials.type, updatedAt: credentials.updatedAt });
    return updated;
  }

  async delete(id: string, userId: string, workspaceId: string) {
    await this.getById(id, userId, workspaceId);
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin']);
    await db.delete(credentials).where(eq(credentials.id, id));
  }
}

export const credentialService = new CredentialService();
