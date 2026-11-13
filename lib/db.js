import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const timestamp = () => new Date().toISOString();
const iso = (value) => value instanceof Date ? value.toISOString() : value;
const userColumns = 'id, email, name, company, phone, location, avatar, provider, created_at, updated_at';

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Add the Supabase PostgreSQL connection string to the server environment.');
  if (!globalThis.__mindpickPool) {
    globalThis.__mindpickPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX || 3),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__mindpickPool;
}

export async function closeDatabase() {
  if (globalThis.__mindpickPool) await globalThis.__mindpickPool.end();
  globalThis.__mindpickPool = undefined;
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
