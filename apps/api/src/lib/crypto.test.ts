import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, generateEncryptionKey } from './crypto';

describe('Credential Encryption Utility', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = generateEncryptionKey();
  });

  it('should encrypt and decrypt a plaintext string successfully', () => {
    const secret = 'super-secret-api-key-12345';
    const { encryptedData, iv } = encrypt(secret);

    expect(encryptedData).toBeDefined();
    expect(iv).toBeDefined();
    expect(encryptedData).not.toBe(secret);

    const decrypted = decrypt(encryptedData, iv);
    expect(decrypted).toBe(secret);
  });

  it('should encrypt and decrypt complex JSON objects', () => {
    const payload = JSON.stringify({
      apiKey: 'sk-proj-xyz987',
      organization: 'org-autozure-dev',
      rateLimit: 500,
    });

    const { encryptedData, iv } = encrypt(payload);
    const decrypted = decrypt(encryptedData, iv);

    expect(JSON.parse(decrypted)).toEqual(JSON.parse(payload));
  });
});
