import pool from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const schemaSQL = readFileSync(join(process.cwd(), 'lib', 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Auto-initialize database when this module is imported
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}