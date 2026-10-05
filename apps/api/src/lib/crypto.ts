import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY environment variable is required');
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32) throw new Error('ENCRYPTION_KEY must be a 32-byte (64 hex char) value');
  return buf;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns { encryptedData: hex, iv: hex }
 */
export function encrypt(plaintext: string): { encryptedData: string; iv: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Append auth tag to encrypted data
  return {
    encryptedData: Buffer.concat([encrypted, authTag]).toString('hex'),
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypt data encrypted by `encrypt()`.
 */
export function decrypt(encryptedData: string, iv: string): string {
  const key = getEncryptionKey();
  const ivBuf = Buffer.from(iv, 'hex');
  const data = Buffer.from(encryptedData, 'hex');

  // Split out auth tag
  const encrypted = data.slice(0, data.length - AUTH_TAG_LENGTH);
  const authTag = data.slice(data.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

/** Generate a random 32-byte hex key (for ENCRYPTION_KEY generation) */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
