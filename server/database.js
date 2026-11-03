import { randomUUID } from 'node:crypto';
import { chmodSync, closeSync, existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyFile = path.join(root, 'data', 'submissions.ndjson');
let database;

const timestamp = () => new Date().toISOString();
const userColumns = 'id, email, name, company, phone, location, avatar, provider, created_at, updated_at';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id, email: row.email, name: row.name, company: row.company, phone: row.phone,
    location: row.location, avatar: row.avatar, provider: row.provider,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    orderId: row.order_id, reference: row.reference, userId: row.user_id,
    productId: row.product_id, productName: row.product_name, quantity: row.quantity,
    total: row.total, currency: row.currency, status: row.status,
    customer: JSON.parse(row.customer_json), stripeSessionId: row.stripe_session_id || '',
    paymentStatus: row.payment_status || '', trackingNumber: row.tracking_number || '',
    carrier: row.carrier || '', createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function openDatabase() {
  if (database) return database;
  const filename = process.env.DATABASE_PATH || path.join(root, 'data', 'gonidoncloud.db');
  mkdirSync(path.dirname(filename), { recursive: true });
  closeSync(openSync(filename, 'a', 0o600));
  chmodSync(filename, 0o600);
  database = new DatabaseSync(filename);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      provider TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
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
      total INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      stripe_session_id TEXT,
      payment_status TEXT,
      tracking_number TEXT,
      carrier TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON orders(stripe_session_id);
    CREATE TABLE IF NOT EXISTS order_events (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      status TEXT,
      stripe_session_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id, created_at);
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS submissions_type_idx ON submissions(type, created_at DESC);
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  for (const suffix of ['-wal', '-shm']) {
    if (existsSync(`${filename}${suffix}`)) chmodSync(`${filename}${suffix}`, 0o600);
  }
  return database;
}

export function initializeDatabase() {
  const db = openDatabase();
  migrateLegacyData(db);
  return db;
}

export function closeDatabase() {
  if (database) database.close();
  database = undefined;
}

export function databaseHealthy() {
  return openDatabase().prepare('SELECT 1 AS ok').get().ok === 1;
}

export function getUser(id) {
  if (!id) return null;
  return mapUser(openDatabase().prepare(`SELECT ${userColumns} FROM users WHERE id = ?`).get(id));
}

export function saveUser(user) {
  const updatedAt = user.updatedAt || timestamp();
  openDatabase().prepare(`
    INSERT INTO users (id, email, name, company, phone, location, avatar, provider, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email, name = excluded.name, company = excluded.company,
      phone = excluded.phone, location = excluded.location, avatar = excluded.avatar,
      provider = excluded.provider, updated_at = excluded.updated_at
  `).run(
    user.id, user.email.toLowerCase(), user.name, user.company || '', user.phone || '',
    user.location || '', user.avatar || '', user.provider, user.createdAt || updatedAt, updatedAt,
  );
  return getUser(user.id);
}

export function getSessionUser(id) {
  if (!id) return null;
  const db = openDatabase();
  const row = db.prepare(`SELECT u.id, u.email, u.name, u.company, u.phone, u.location, u.avatar, u.provider, u.created_at, u.updated_at
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?`).get(id, Date.now());
  if (!row) {
    db.prepare('DELETE FROM sessions WHERE id = ? AND expires_at <= ?').run(id, Date.now());
    return null;
  }
  return mapUser(row);
}

export function createSession(id, userId, expiresAt) {
  const db = openDatabase();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(id, userId, expiresAt, timestamp());
}

export function deleteSession(id) {
  if (id) openDatabase().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function createOrder(order) {
  const createdAt = order.createdAt || timestamp();
  openDatabase().prepare(`
    INSERT INTO orders (order_id, reference, user_id, product_id, product_name, quantity, total, currency, status, customer_json, stripe_session_id, payment_status, tracking_number, carrier, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(order_id) DO NOTHING
  `).run(
    order.orderId, order.reference, order.userId || null, order.productId, order.productName,
    order.quantity, order.total, order.currency, order.status, JSON.stringify(order.customer || {}),
    order.stripeSessionId || null, order.paymentStatus || null, order.trackingNumber || null,
    order.carrier || null, createdAt, order.updatedAt || createdAt,
  );
  return getOrder(order.orderId);
}

export function getOrder(orderId) {
  if (!orderId) return null;
  return mapOrder(openDatabase().prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId));
}

export function listOrders(userId) {
  return openDatabase().prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(mapOrder);
}

export function updateOrder(orderId, update) {
  const db = openDatabase();
  const columns = {
    status: 'status', stripeSessionId: 'stripe_session_id', paymentStatus: 'payment_status',
    trackingNumber: 'tracking_number', carrier: 'carrier',
  };
  const entries = Object.entries(columns).filter(([key]) => update[key] !== undefined);
  if (!entries.length || !getOrder(orderId)) return null;
  const updatedAt = timestamp();
  db.prepare(`UPDATE orders SET ${entries.map(([, column]) => `${column} = ?`).join(', ')}, updated_at = ? WHERE order_id = ?`)
    .run(...entries.map(([key]) => update[key]), updatedAt, orderId);
  db.prepare('INSERT INTO order_events (id, order_id, event_type, status, stripe_session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), orderId, update.eventType || 'order_update', update.status || null, update.stripeSessionId || null, update.createdAt || updatedAt);
  return getOrder(orderId);
}

export function createSubmission(type, payload) {
  const record = { type, id: randomUUID(), createdAt: timestamp(), ...payload };
  openDatabase().prepare('INSERT INTO submissions (id, type, payload_json, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING')
    .run(record.id, type, JSON.stringify(record), record.createdAt);
  return record;
}

function migrateLegacyData(db) {
  if (db.prepare("SELECT value FROM app_meta WHERE key = 'legacy_ndjson_migrated'").get() || !existsSync(legacyFile)) return;
  const records = readFileSync(legacyFile, 'utf8').split('\n').filter(Boolean).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const record of records) {
      if (record.type === 'account' || record.type === 'profile') saveUser(record);
      else if (record.type === 'order') createOrder(record);
      else if ((record.type === 'order_update' || record.type === 'payment') && record.orderId) updateOrder(record.orderId, { ...record, eventType: record.type });
      else if (record.type === 'inquiry' || record.type === 'newsletter') createSubmission(record.type, record);
    }
    db.prepare("INSERT INTO app_meta (key, value) VALUES ('legacy_ndjson_migrated', ?)").run(timestamp());
    db.exec('COMMIT');
    console.log(`Imported ${records.length} legacy records into SQLite.`);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
