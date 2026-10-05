import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, refreshTokens } from '../../db/schema';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { AppError, ConflictError, UnauthorizedError } from '../../middleware/error.middleware';
import { RegisterBody, LoginBody } from './auth.schema';
import { addDays } from 'date-fns';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterBody) {
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
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = signAccessToken({ sub: userId, email });
    const refreshToken = signRefreshToken({ sub: userId, email });

    // Persist refresh token
    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt: addDays(new Date(), 7),
    });

    return { accessToken, refreshToken };
  }

  async getMe(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { passwordHash: false },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return user;
  }
}

export const authService = new AuthService();
