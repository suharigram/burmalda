import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyFile = path.join(root, 'data', 'submissions.ndjson');
let pool;

const timestamp = () => new Date().toISOString();
const iso = (value) => value instanceof Date ? value.toISOString() : value;
const userColumns = 'id, email, name, company, phone, location, avatar, provider, created_at, updated_at';

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Add the Railway PostgreSQL connection string to the server environment.');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id, email: row.email, name: row.name, company: row.company, phone: row.phone,
    location: row.location, avatar: row.avatar, provider: row.provider,
    createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    orderId: row.order_id, reference: row.reference, userId: row.user_id,
    productId: row.product_id, productName: row.product_name, quantity: Number(row.quantity),
    total: Number(row.total), currency: row.currency, status: row.status,
    customer: typeof row.customer_json === 'string' ? JSON.parse(row.customer_json) : row.customer_json,
    stripeSessionId: row.stripe_session_id || '', paymentStatus: row.payment_status || '',
    trackingNumber: row.tracking_number || '', carrier: row.carrier || '',
    createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
  };
}

export async function initializeDatabase() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      provider TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total BIGINT NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_json JSONB NOT NULL,
      stripe_session_id TEXT,
      payment_status TEXT,
      tracking_number TEXT,
      carrier TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON orders(stripe_session_id);
    CREATE TABLE IF NOT EXISTS order_events (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      status TEXT,
      stripe_session_id TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id, created_at);
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS submissions_type_idx ON submissions(type, created_at DESC);
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  await migrateExistingData(db);
  return db;
}

export async function closeDatabase() {
  if (pool) await pool.end();
  pool = undefined;
}

export async function databaseHealthy() {
  const { rows } = await getPool().query('SELECT 1 AS ok');
  return rows[0].ok === 1;
}

export async function getUser(id, client) {
  if (!id) return null;
  const { rows } = await (client || getPool()).query(`SELECT ${userColumns} FROM users WHERE id = $1`, [id]);
  return mapUser(rows[0]);
}

export async function saveUser(user, client) {
  const db = client || getPool();
  const updatedAt = user.updatedAt || timestamp();
  await db.query(`
    INSERT INTO users (id, email, name, company, phone, location, avatar, provider, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT(id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, company = EXCLUDED.company,
      phone = EXCLUDED.phone, location = EXCLUDED.location, avatar = EXCLUDED.avatar,
      provider = EXCLUDED.provider, updated_at = EXCLUDED.updated_at
  `, [
    user.id, user.email.toLowerCase(), user.name, user.company || '', user.phone || '',
    user.location || '', user.avatar || '', user.provider, user.createdAt || updatedAt, updatedAt,
  ]);
  return getUser(user.id, db);
}

export async function getSessionUser(id) {
  if (!id) return null;
  const db = getPool();
  const { rows } = await db.query(`
    SELECT u.id, u.email, u.name, u.company, u.phone, u.location, u.avatar, u.provider, u.created_at, u.updated_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = $1 AND s.expires_at > $2
  `, [id, Date.now()]);
  if (!rows[0]) {
    await db.query('DELETE FROM sessions WHERE id = $1 AND expires_at <= $2', [id, Date.now()]);
    return null;
  }
  return mapUser(rows[0]);
}

export async function createSession(id, userId, expiresAt) {
  const db = getPool();
  await db.query('DELETE FROM sessions WHERE expires_at <= $1', [Date.now()]);
  await db.query('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4)', [id, userId, expiresAt, timestamp()]);
}

export async function deleteSession(id) {
  if (id) await getPool().query('DELETE FROM sessions WHERE id = $1', [id]);
}

export async function createOrder(order, client) {
  const db = client || getPool();
  const createdAt = order.createdAt || timestamp();
  await db.query(`
    INSERT INTO orders (order_id, reference, user_id, product_id, product_name, quantity, total, currency, status, customer_json, stripe_session_id, payment_status, tracking_number, carrier, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT(order_id) DO NOTHING
  `, [
    order.orderId, order.reference, order.userId || null, order.productId, order.productName,
    order.quantity, order.total, order.currency, order.status, JSON.stringify(order.customer || {}),
    order.stripeSessionId || null, order.paymentStatus || null, order.trackingNumber || null,
    order.carrier || null, createdAt, order.updatedAt || createdAt,
  ]);
  return getOrder(order.orderId, db);
}

export async function getOrder(orderId, client) {
  if (!orderId) return null;
  const { rows } = await (client || getPool()).query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
  return mapOrder(rows[0]);
}

export async function listOrders(userId) {
  const { rows } = await getPool().query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(mapOrder);
}

export async function updateOrder(orderId, update, client) {
  const columns = {
    status: 'status', stripeSessionId: 'stripe_session_id', paymentStatus: 'payment_status',
    trackingNumber: 'tracking_number', carrier: 'carrier',
  };
  const entries = Object.entries(columns).filter(([key]) => update[key] !== undefined);
  if (!entries.length) return null;
  const db = client || await getPool().connect();
  const transaction = !client;
  try {
    if (transaction) await db.query('BEGIN');
    if (!await getOrder(orderId, db)) {
      if (transaction) await db.query('COMMIT');
      return null;
    }
    const updatedAt = update.updatedAt || timestamp();
    const values = entries.map(([key]) => update[key]);
    const assignments = entries.map(([, column], index) => `${column} = $${index + 1}`);
    await db.query(`UPDATE orders SET ${assignments.join(', ')}, updated_at = $${values.length + 1} WHERE order_id = $${values.length + 2}`, [...values, updatedAt, orderId]);
    await db.query('INSERT INTO order_events (id, order_id, event_type, status, stripe_session_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT(id) DO NOTHING', [
      update.id || randomUUID(), orderId, update.eventType || 'order_update', update.status || null,
      update.stripeSessionId || null, update.createdAt || updatedAt,
    ]);
    const order = await getOrder(orderId, db);
    if (transaction) await db.query('COMMIT');
    return order;
  } catch (error) {
    if (transaction) await db.query('ROLLBACK');
    throw error;
  } finally {
    if (transaction) db.release();
  }
}

export async function createSubmission(type, payload, client) {
  const record = { type, id: randomUUID(), createdAt: timestamp(), ...payload };
  await (client || getPool()).query('INSERT INTO submissions (id, type, payload_json, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT(id) DO NOTHING', [
    record.id, type, JSON.stringify(record), record.createdAt,
  ]);
  return record;
}

async function migrationApplied(client, key) {
  const { rows } = await client.query('SELECT value FROM app_meta WHERE key = $1', [key]);
  return Boolean(rows[0]);
}

async function migrateSqlite(db, filename) {
  if (await migrationApplied(db, 'sqlite_migrated')) return;
  const sqlite = new DatabaseSync(filename, { readOnly: true });
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
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const user of users) await saveUser(user, client);
      for (const order of orders) await createOrder(order, client);
      for (const session of sessions) await client.query('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT(id) DO NOTHING', [session.id, session.user_id, session.expires_at, session.created_at]);
      for (const event of events) await client.query('INSERT INTO order_events (id, order_id, event_type, status, stripe_session_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT(id) DO NOTHING', [event.id, event.order_id, event.event_type, event.status, event.stripe_session_id, event.created_at]);
      for (const submission of submissions) await createSubmission(submission.type, JSON.parse(submission.payload_json), client);
      await client.query("INSERT INTO app_meta (key, value) VALUES ('sqlite_migrated', $1), ('legacy_ndjson_migrated', $1) ON CONFLICT(key) DO NOTHING", [timestamp()]);
      await client.query('COMMIT');
      console.log(`Imported SQLite data into PostgreSQL: ${users.length} users, ${orders.length} orders, ${sessions.length} sessions.`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    sqlite.close();
  }
}

async function migrateLegacyNdjson(db) {
  if (await migrationApplied(db, 'legacy_ndjson_migrated')) return;
  const records = readFileSync(legacyFile, 'utf8').split('\n').filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const record of records) {
      if (record.type === 'account' || record.type === 'profile') await saveUser(record, client);
      else if (record.type === 'order') await createOrder(record, client);
      else if ((record.type === 'order_update' || record.type === 'payment') && record.orderId) await updateOrder(record.orderId, { ...record, eventType: record.type }, client);
      else if (record.type === 'inquiry' || record.type === 'newsletter') await createSubmission(record.type, record, client);
    }
    await client.query("INSERT INTO app_meta (key, value) VALUES ('legacy_ndjson_migrated', $1)", [timestamp()]);
    await client.query('COMMIT');
    console.log(`Imported ${records.length} legacy records into PostgreSQL.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrateExistingData(db) {
  const sqliteFile = process.env.SQLITE_PATH || path.join(root, 'data', 'gonidoncloud.db');
  if (existsSync(sqliteFile)) await migrateSqlite(db, sqliteFile);
  else if (existsSync(legacyFile)) await migrateLegacyNdjson(db);
}
