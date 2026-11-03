import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCart } from '../shared/catalog.js';
import { deliverRecord, isSmtpConfigured } from './mailer.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const attempts = new Map();
const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
};
const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const reference = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;

async function readBody(req, limit = 65536) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const body = await readBody(req);
  if (!body.length) return {};
  try { return JSON.parse(body.toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON body.'), { status: 400 }); }
}

async function store(collection, record) {
  const directory = path.join(root, 'data');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await appendFile(path.join(directory, `${collection}.jsonl`), `${JSON.stringify(record)}\n`, { mode: 0o600 });
}

function rateLimited(req) {
  const key = req.socket.remoteAddress || 'local';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 40;
}

function siteOrigin(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  return `${protocol}://${req.headers.host || 'localhost:5173'}`;
}

function verifyStripeSignature(body, header) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((part) => part.split('=')));
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac('sha256', secret).update(`${parts.t}.${body.toString('utf8')}`).digest('hex');
  const actualBuffer = Buffer.from(parts.v1);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer) && Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
}

async function createCheckout(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) return json(res, 503, { code: 'PAYMENTS_NOT_CONFIGURED', message: 'Card payments are not configured yet. Please choose bank invoice or contact sales.' });
  const { items } = await readJson(req);
  const cart = validateCart(items);
  const orderId = reference('GC-ORDER');
  const origin = siteOrigin(req);
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${origin}/#/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#/checkout`,
    client_reference_id: orderId,
    billing_address_collection: 'required',
    allow_promotion_codes: 'true',
    'metadata[order_id]': orderId,
    'metadata[skus]': cart.map((item) => `${item.sku}x${item.quantity}`).join(','),
    'shipping_options[0][shipping_rate_data][type]': 'fixed_amount',
    'shipping_options[0][shipping_rate_data][fixed_amount][amount]': '25000',
    'shipping_options[0][shipping_rate_data][fixed_amount][currency]': 'usd',
    'shipping_options[0][shipping_rate_data][display_name]': 'Insured freight',
    'shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]': 'business_day',
    'shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]': '5',
    'shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]': 'business_day',
    'shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]': '15',
  });
  cart.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, 'usd');
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.priceCents));
    params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    params.set(`line_items[${index}][price_data][product_data][description]`, item.description);
    params.set(`line_items[${index}][price_data][product_data][metadata][sku]`, item.sku);
  });
  ['US', 'CA', 'GB', 'DE', 'FR', 'NL'].forEach((country, index) => params.set(`shipping_address_collection[allowed_countries][${index}]`, country));
  if (process.env.STRIPE_AUTOMATIC_TAX === 'true') params.set('automatic_tax[enabled]', 'true');
  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(20000),
  });
  const session = await stripeResponse.json();
  if (!stripeResponse.ok) return json(res, 502, { code: 'PAYMENT_PROVIDER_ERROR', message: session?.error?.message || 'Unable to create a secure payment session.' });
  await store('orders', { id: orderId, stripeSessionId: session.id, status: 'pending', items: cart, createdAt: new Date().toISOString() });
  return json(res, 201, { orderId, url: session.url });
}

export async function apiMiddleware(req, res, next = () => {}) {
  const url = new URL(req.url, 'http://localhost');
  const route = url.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
  if (!['/health', '/inquiries', '/newsletter', '/payments/checkout', '/payments/status', '/stripe/webhook'].includes(route)) return next();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (rateLimited(req)) return json(res, 429, { message: 'Too many requests. Please wait a few minutes and try again.' });

  try {
    if (route === '/health' && req.method === 'GET') return json(res, 200, { ok: true, payments: Boolean(process.env.STRIPE_SECRET_KEY), email: isSmtpConfigured() });
    if (route === '/inquiries' && req.method === 'POST') {
      const body = await readJson(req);
      if (clean(body.website, 100)) return json(res, 201, { id: reference('GC'), status: 'received' });
      const email = clean(body.email, 254).toLowerCase();
      const name = clean(body.name, 120);
      if (!validEmail(email)) return json(res, 422, { message: 'Enter a valid email address.' });
      if (!name) return json(res, 422, { message: 'Enter your name.' });
      const record = {
        id: reference(body.type === 'invoice' ? 'GC-INV' : 'GC'), type: clean(body.type, 40) || 'contact', name, email,
        company: clean(body.company, 160), interest: clean(body.interest, 120), message: clean(body.message, 5000),
        country: clean(body.country, 100), address: clean(body.address, 500), poNumber: clean(body.poNumber, 100),
        requestType: clean(body.requestType, 100), items: Array.isArray(body.items) ? body.items.slice(0, 20) : [],
        consent: body.consent === true, createdAt: new Date().toISOString(),
      };
      if (record.type === 'invoice') {
        record.items = validateCart(body.items);
        if (!record.company || !record.country || !record.address || !record.consent) return json(res, 422, { message: 'Complete the company, delivery, and terms fields.' });
      }
      await store('inquiries', record);
      let emailed = false;
      try { emailed = (await deliverRecord(record)).emailed; }
      catch (error) { console.error('Email delivery failed; request remains in the server outbox:', error.message); }
      return json(res, 201, { id: record.id, status: 'received', delivery: emailed ? 'email' : 'outbox' });
    }
    if (route === '/newsletter' && req.method === 'POST') {
      const body = await readJson(req);
      if (clean(body.website, 100)) return json(res, 201, { status: 'subscribed' });
      const email = clean(body.email, 254).toLowerCase();
      if (!validEmail(email)) return json(res, 422, { message: 'Enter a valid email address.' });
      const record = { id: reference('GC-SUB'), email, type: 'newsletter', consent: body.consent === true, createdAt: new Date().toISOString() };
      if (!record.consent) return json(res, 422, { message: 'Consent is required to subscribe.' });
      await store('subscribers', record);
      return json(res, 201, { id: record.id, status: 'subscribed' });
    }
    if (route === '/payments/checkout' && req.method === 'POST') return await createCheckout(req, res);
    if (route === '/payments/status' && req.method === 'GET') {
      if (!process.env.STRIPE_SECRET_KEY) return json(res, 503, { message: 'Payment verification is not configured.' });
      const sessionId = clean(url.searchParams.get('session_id'), 200);
      if (!/^cs_(test|live)_/.test(sessionId)) return json(res, 400, { message: 'Invalid payment session.' });
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }, signal: AbortSignal.timeout(15000) });
      const session = await response.json();
      if (!response.ok) return json(res, 404, { message: 'Payment session not found.' });
      return json(res, 200, { id: session.client_reference_id, status: session.status, paymentStatus: session.payment_status, amountTotal: session.amount_total, email: session.customer_details?.email || '' });
    }
    if (route === '/stripe/webhook' && req.method === 'POST') {
      const body = await readBody(req, 1048576);
      if (!verifyStripeSignature(body, req.headers['stripe-signature'])) return json(res, 400, { message: 'Invalid webhook signature.' });
      const event = JSON.parse(body.toString('utf8'));
      if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object;
        const record = { id: session.client_reference_id || reference('GC-ORDER'), stripeSessionId: session.id, status: session.payment_status, email: session.customer_details?.email, amountTotal: session.amount_total, createdAt: new Date().toISOString() };
        await store('paid-orders', record);
        try { await deliverRecord({ ...record, type: 'paid-order' }); } catch (error) { console.error('Paid order notification failed:', error.message); }
      }
      return json(res, 200, { received: true });
    }
    return json(res, 405, { message: 'Method not allowed.' });
  } catch (error) {
    console.error('API error:', error);
    return json(res, error.status || 422, { message: error.status ? error.message : error.message || 'Unable to process your request.' });
  }
}
