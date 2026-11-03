import { existsSync } from 'node:fs';
import { closeDatabase, initializeDatabase } from './database.js';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') process.loadEnvFile('.env');

try {
  await initializeDatabase();
  console.log('PostgreSQL schema and data migration completed.');
} finally {
  await closeDatabase();
}
