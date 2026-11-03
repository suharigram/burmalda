import http from 'node:http';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { getCatalogItem } from '../src/commerceData.js';
import { authApi, sessionUser } from './auth.js';
import { closeDatabase, createOrder, createSubmission, databaseHealthy, getOrder, initializeDatabase, updateOrder } from './database.js';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') process.loadEnvFile('.env');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const production = process.env.NODE_ENV === 'production';
const trustProxy = process.env.TRUST_PROXY === 'true';
const publicUrl = (process.env.PUBLIC_URL || `http://localhost:${process.env.PUBLIC_PORT || 5173}`).replace(/\/$/, '');
const attempts = new Map();
let transporter;

initializeDatabase();

const json = (response, status, payload) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
};
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const reference = (prefix) => `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 6).toUpperCase()}`;

function rateLimited(request) {
  const forwarded = trustProxy ? text(request.headers['x-forwarded-for'], 200).split(',')[0].trim() : '';
  const key = forwarded || request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 40) return true;
  recent.push(now); attempts.set(key, recent);
  return false;
}

async function body(request, limit = 65536) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function mailTransport() {
  if (!process.env.SMTP_URL) return null;
  if (!transporter) transporter = nodemailer.createTransport(process.env.SMTP_URL);
  return transporter;
}

async function deliver(subject, message, replyTo, customerEmail) {
  const delivered = [];
  if (process.env.FORM_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.FORM_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, message, replyTo, customerEmail, source: 'gonidoncloud.com' }), signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
      delivered.push('webhook');
    } catch (error) { console.error('Webhook delivery failed:', error.message); }
  }
  const mail = mailTransport();
  if (mail && process.env.INQUIRY_TO_EMAIL) {
    try {
      await mail.sendMail({ from: process.env.MAIL_FROM || process.env.INQUIRY_TO_EMAIL, to: process.env.INQUIRY_TO_EMAIL, replyTo, subject, text: message });
      delivered.push('email');
      if (customerEmail) {
        await mail.sendMail({ from: process.env.MAIL_FROM || process.env.INQUIRY_TO_EMAIL, to: customerEmail, subject: `GonidonCloud: ${subject}`, text: `Thank you for contacting GonidonCloud.\n\nWe received your request and our team will respond within one business day.\n\nReference: ${subject}\n\n— GonidonCloud` });
      }
    } catch (error) { console.error('Email delivery failed:', error.message); }
  }
  return delivered;
}

function deliveryConfigured() {
  return Boolean(process.env.FORM_WEBHOOK_URL || (process.env.SMTP_URL && process.env.INQUIRY_TO_EMAIL));
}

function inquiryPayload(input) {
  const value = {
    firstName: text(input.firstName, 80), lastName: text(input.lastName, 80), email: text(input.email, 254),
    company: text(input.company, 160), interest: text(input.interest, 100), message: text(input.message, 5000),
    privacyConsent: input.privacyConsent === true || input.privacyConsent === 'true',
  };
  if (!value.firstName || !value.lastName || !value.company || !validEmail(value.email) || !value.privacyConsent) return null;
  return value;
}

function customerPayload(input = {}) {
  const value = {
    name: text(input.name, 120), email: text(input.email, 254), company: text(input.company, 160),
    country: text(input.country, 2).toUpperCase(), address: text(input.address, 220), city: text(input.city, 100),
    postalCode: text(input.postalCode, 24), purchaseOrder: text(input.purchaseOrder, 80),
    paymentMethod: input.paymentMethod === 'invoice' ? 'invoice' : 'card',
  };
  const allowedCountries = ['US', 'CA', 'GB', 'DE', 'FR', 'NL', 'AE', 'SG', 'JP', 'AU'];
  if (!value.name || !value.company || !validEmail(value.email) || !allowedCountries.includes(value.country) || !value.address || !value.city || !value.postalCode || input.terms !== true || input.trade !== true) return null;
  return value;
}

function verifyStripe(raw, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${parts.t}.${raw}`).digest('hex');
  const a = Buffer.from(parts.v1); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
}

async function createStripeSession(order, item, quantity, customer) {
  const params = new URLSearchParams({
    ui_mode: 'hosted_page', mode: 'payment',
    success_url: `${publicUrl}/#/order/success/${order.orderId}`, cancel_url: `${publicUrl}/#/order/cancelled/${order.orderId}`,
    'line_items[0][quantity]': String(quantity),
    'line_items[0][price_data][currency]': item.currency, 'line_items[0][price_data][unit_amount]': String(item.unitAmount),
    'line_items[0][price_data][product_data][name]': `Pre-order · ${item.name}`, 'line_items[0][price_data][product_data][description]': `${item.description} Expected to ship Q1 2027.`,
    billing_address_collection: 'auto', 'phone_number_collection[enabled]': 'false', 'automatic_tax[enabled]': 'false',
    allow_promotion_codes: 'false', submit_type: 'auto', integration_identifier: 'hosted_web_0001', origin_context: 'web',
    customer_email: customer.email, 'metadata[orderId]': order.orderId, 'payment_intent_data[metadata][orderId]': order.orderId,
  });
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': order.orderId }, body: params, signal: AbortSignal.timeout(15000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Stripe Checkout failed');
  return result;
}

async function api(request, response, url) {
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/account/')) return authApi(request, response, url, { json, body, publicUrl, production, text });
  if (request.method === 'GET' && url.pathname === '/api/health') return json(response, 200, { ok: databaseHealthy(), database: 'sqlite', emailDelivery: deliveryConfigured(), cardPayments: Boolean(process.env.STRIPE_SECRET_KEY) });
  if (request.method === 'GET' && url.pathname.startsWith('/api/orders/')) {
    const order = getOrder(decodeURIComponent(url.pathname.slice('/api/orders/'.length)));
    if (!order) return json(response, 404, { message: 'Order not found.' });
    return json(response, 200, { orderId: order.orderId, reference: order.reference, status: order.status, total: order.total, currency: order.currency });
  }
  if (request.method === 'POST' && url.pathname === '/api/stripe/webhook') {
    const raw = await body(request, 1024 * 1024);
    if (!verifyStripe(raw.toString(), request.headers['stripe-signature'])) return json(response, 400, { message: 'Invalid webhook signature.' });
    const event = JSON.parse(raw.toString());
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const order = getOrder(orderId);
      const paymentConfirmed = event.type === 'checkout.session.async_payment_succeeded' || session.payment_status === 'paid';
      if (order && paymentConfirmed) {
        updateOrder(orderId, { status: 'paid', stripeSessionId: session.id, paymentStatus: session.payment_status, eventType: 'payment' });
        if (order.status !== 'paid') await deliver(`Paid pre-order ${orderId}`, `Stripe Checkout completed.\nPre-order: ${orderId}\nSession: ${session.id}\nAmount: ${session.amount_total} ${session.currency}`, session.customer_email);
      }
    }
    return json(response, 200, { received: true });
  }
  if (request.method !== 'POST') return json(response, 405, { message: 'Method not allowed.' });
  if (rateLimited(request)) return json(response, 429, { message: 'Too many requests. Please wait and try again.' });
  const input = JSON.parse((await body(request)).toString() || '{}');
  if (input.website) return json(response, 200, { received: true });

  if (url.pathname === '/api/inquiries') {
    const inquiry = inquiryPayload(input);
    if (!inquiry) return json(response, 400, { message: 'Please check the required fields and work email.' });
    if (production && !deliveryConfigured()) return json(response, 503, { message: 'Form delivery is not configured. Please email sales@gonidoncloud.com.' });
    const requestId = reference('GC');
    createSubmission('inquiry', { requestId, ...inquiry });
    await deliver(`GonidonCloud inquiry ${requestId}`, `Reference: ${requestId}\nName: ${inquiry.firstName} ${inquiry.lastName}\nEmail: ${inquiry.email}\nCompany: ${inquiry.company}\nInterest: ${inquiry.interest}\n\n${inquiry.message}`, inquiry.email, inquiry.email);
    return json(response, 201, { ok: true, requestId });
  }
  if (url.pathname === '/api/newsletter') {
    const email = text(input.email, 254);
    if (!validEmail(email)) return json(response, 400, { message: 'Enter a valid work email.' });
    createSubmission('newsletter', { email, source: 'website-footer' });
    return json(response, 201, { ok: true });
  }
  if (url.pathname === '/api/checkout') {
    const item = getCatalogItem(text(input.productId, 60));
    const quantity = Number(input.quantity);
    const customer = customerPayload(input.customer);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > item.maxQuantity || !customer) return json(response, 400, { message: 'Please check the product, quantity, customer details, and required agreements.' });
    if (customer.paymentMethod === 'invoice' && production && !deliveryConfigured()) return json(response, 503, { message: 'Invoice delivery is not configured. Please contact orders@gonidoncloud.com.' });
    const orderId = randomUUID(); const orderReference = reference('GC-ORD');
    const order = { orderId, reference: orderReference, productId: item.id, productName: item.name, quantity, total: item.unitAmount * quantity, currency: item.currency, status: customer.paymentMethod === 'invoice' ? 'awaiting_invoice' : 'pending_payment', customer, userId: sessionUser(request)?.id || null };
    createOrder(order);
    if (customer.paymentMethod === 'invoice') {
      await deliver(`Pre-order invoice ${orderReference}`, JSON.stringify(order, null, 2), customer.email, customer.email);
      return json(response, 201, { ok: true, orderId, reference: orderReference, status: 'awaiting_invoice' });
    }
    if (!process.env.STRIPE_SECRET_KEY) return json(response, 503, { message: 'Card payments are not configured in this environment. Choose a pro forma invoice or contact sales.' });
    try {
      const session = await createStripeSession(order, item, quantity, customer);
      updateOrder(orderId, { status: 'checkout_created', stripeSessionId: session.id });
      return json(response, 201, { checkoutUrl: session.url, orderId });
    } catch (error) {
      console.error('Stripe Checkout failed:', error.message);
      updateOrder(orderId, { status: 'checkout_failed' });
      return json(response, 502, { message: 'Secure card checkout is temporarily unavailable. Choose a pro forma invoice or try again later.' });
    }
  }
  return json(response, 404, { message: 'API route not found.' });
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json' };
async function staticFile(response, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { pathname = '/'; }
  let file = path.resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(dist)) file = path.join(dist, 'index.html');
  try { if (!(await stat(file)).isFile()) file = path.join(dist, 'index.html'); } catch { file = path.join(dist, 'index.html'); }
  try {
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    response.end(content);
  } catch { response.writeHead(503, { 'Content-Type': 'text/plain' }); response.end('Build the site first with npm run build.'); }
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  if (production) response.setHeader('Strict-Transport-Security', 'max-age=31536000');
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await api(request, response, url);
    else await staticFile(response, url);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) json(response, error.message === 'PAYLOAD_TOO_LARGE' ? 413 : error instanceof SyntaxError ? 400 : 500, { message: error instanceof SyntaxError ? 'Invalid JSON request.' : 'The request could not be processed.' });
  }
});
server.listen(port, '0.0.0.0', () => console.log(`GonidonCloud server listening on http://localhost:${port} (${production ? 'production' : 'development'})`));
const shutdown = () => server.close(() => { closeDatabase(); process.exit(0); });
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
