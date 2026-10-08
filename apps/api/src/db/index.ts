import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://flowforge:flowforge_secret@localhost:5432/flowforge';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;

export let isDbConnected = false;
export function setDbConnected(val: boolean) {
  isDbConnected = val;
}
