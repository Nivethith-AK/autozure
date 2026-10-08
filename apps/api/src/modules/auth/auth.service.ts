import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, isDbConnected } from '../../db';
import { memoryStore, StoredUser } from '../../db/memoryStore';
import { users, refreshTokens } from '../../db/schema';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { AppError, ConflictError, UnauthorizedError } from '../../middleware/error.middleware';
import { RegisterBody, LoginBody } from './auth.schema';
import { addDays } from 'date-fns';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterBody) {
    if (!isDbConnected) {
      const emailLower = data.email.toLowerCase();
      const existing = Array.from(memoryStore.users.values()).find(u => u.email === emailLower);
      if (existing) throw new ConflictError('Email already registered');

      const passwordHash = await bcrypt.hash(data.password, 8);
      const id = `user-${Date.now()}`;
      const newUser: StoredUser = {
        id,
        email: emailLower,
        name: data.name,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(id, newUser);

      // Add to default workspace
      memoryStore.workspaceMembers.set(`ws-default-001:${id}`, {
        workspaceId: 'ws-default-001',
        userId: id,
        role: 'editor',
      });

      const tokens = await this.generateTokens(newUser.id, newUser.email);
      const { passwordHash: _, ...userSafe } = newUser;
      return { user: userSafe, tokens };
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(data: LoginBody) {
    if (!isDbConnected) {
      const emailLower = data.email.toLowerCase();
      const user = Array.from(memoryStore.users.values()).find(u => u.email === emailLower);
      if (!user) throw new UnauthorizedError('Invalid email or password');

      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) throw new UnauthorizedError('Invalid email or password');

      const tokens = await this.generateTokens(user.id, user.email);
      const { passwordHash: _, ...userSafe } = user;
      return { user: userSafe, tokens };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      tokens,
    };
  }

  async refresh(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (!isDbConnected) {
      const stored = memoryStore.refreshTokens.get(token);
      if (!stored || stored.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token not found or expired');
      }
      memoryStore.refreshTokens.delete(token);
      return this.generateTokens(payload.sub, payload.email);
    }

    const stored = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token not found or expired');
    }

    // Rotate: delete old, issue new
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    return this.generateTokens(payload.sub, payload.email);
  }

  async logout(token: string) {
    if (!isDbConnected) {
      memoryStore.refreshTokens.delete(token);
      return;
    }
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = signAccessToken({ sub: userId, email });
    const refreshToken = signRefreshToken({ sub: userId, email });

    if (!isDbConnected) {
      memoryStore.refreshTokens.set(refreshToken, {
        userId,
        token: refreshToken,
        expiresAt: addDays(new Date(), 7),
      });
      return { accessToken, refreshToken };
    }

    // Persist refresh token
    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt: addDays(new Date(), 7),
    });

    return { accessToken, refreshToken };
  }

  async getMe(userId: string) {
    if (!isDbConnected) {
      const user = memoryStore.users.get(userId);
      if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
      const { passwordHash: _, ...userSafe } = user;
      return userSafe;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { passwordHash: false },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return user;
  }
}

export const authService = new AuthService();
