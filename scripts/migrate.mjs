import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { closeDatabase, createOrder, createSubmission, getPool, saveUser, updateOrder } from '../lib/db.js';

for (const filename of ['.env', '.env.local']) {
  if (existsSync(filename) && typeof process.loadEnvFile === 'function') process.loadEnvFile(filename);
}

const timestamp = () => new Date().toISOString();
const sqliteFile = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'gonidoncloud.db');
const legacyFile = path.join(process.cwd(), 'data', 'submissions.ndjson');

async function migrationApplied(client, key) {
  const { rows } = await client.query('SELECT value FROM app_meta WHERE key = $1', [key]);
  return Boolean(rows[0]);
}

async function migrateSqlite(client) {
  if (await migrationApplied(client, 'sqlite_migrated')) return;
  const { DatabaseSync } = await import('node:sqlite');
  const sqlite = new DatabaseSync(sqliteFile, { readOnly: true });
  try {
    const users = sqlite.prepare('SELECT id, email, name, company, phone, location, avatar, provider, created_at AS createdAt, updated_at AS updatedAt FROM users').all();
    const sessions = sqlite.prepare('SELECT * FROM sessions').all();
    const orders = sqlite.prepare('SELECT * FROM orders').all().map((row) => ({
      orderId: row.order_id, reference: row.reference, userId: row.user_id, productId: row.product_id,
      productName: row.product_name, quantity: row.quantity, total: row.total, currency: row.currency,
      status: row.status, customer: JSON.parse(row.customer_json), stripeSessionId: row.stripe_session_id,
      paymentStatus: row.payment_status, trackingNumber: row.tracking_number, carrier: row.carrier,
      createdAt: row.created_at, updatedAt: row.updated_at,
    }));
    const events = sqlite.prepare('SELECT * FROM order_events').all();
    const submissions = sqlite.prepare('SELECT * FROM submissions').all();
    await client.query('BEGIN');
    try {
      for (const user of users) await saveUser(user, client);
      for (const order of orders) await createOrder(order, client);
      for (const session of sessions) await client.query('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT(id) DO NOTHING', [session.id, session.user_id, session.expires_at, session.created_at]);
      for (const event of events) await client.query('INSERT INTO order_events (id, order_id, event_type, status, stripe_session_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT(id) DO NOTHING', [event.id, event.order_id, event.event_type, event.status, event.stripe_session_id, event.created_at]);
      for (const submission of submissions) await createSubmission(submission.type, JSON.parse(submission.payload_json), client);
      await client.query("INSERT INTO app_meta (key, value) VALUES ('sqlite_migrated', $1), ('legacy_ndjson_migrated', $1) ON CONFLICT(key) DO NOTHING", [timestamp()]);
      await client.query('COMMIT');
      console.log(`Imported SQLite data: ${users.length} users, ${orders.length} orders, ${sessions.length} sessions.`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    sqlite.close();
  }
}

async function migrateLegacyNdjson(client) {
  if (await migrationApplied(client, 'legacy_ndjson_migrated')) return;
  const records = readFileSync(legacyFile, 'utf8').split('\n').filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  await client.query('BEGIN');
  try {
    for (const record of records) {
      if (record.type === 'account' || record.type === 'profile') await saveUser(record, client);
      else if (record.type === 'order') await createOrder(record, client);
      else if ((record.type === 'order_update' || record.type === 'payment') && record.orderId) await updateOrder(record.orderId, { ...record, eventType: record.type }, client);
      else if (record.type === 'inquiry' || record.type === 'newsletter') await createSubmission(record.type, record, client);
    }
    await client.query("INSERT INTO app_meta (key, value) VALUES ('legacy_ndjson_migrated', $1) ON CONFLICT(key) DO NOTHING", [timestamp()]);
    await client.query('COMMIT');
    console.log(`Imported ${records.length} legacy records.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

const client = await getPool().connect();
try {
  await client.query(readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8'));
  if (existsSync(sqliteFile)) await migrateSqlite(client);
  else if (existsSync(legacyFile)) await migrateLegacyNdjson(client);
  console.log('Supabase PostgreSQL schema and data migration completed.');
} finally {
  client.release();
  await closeDatabase();
}
