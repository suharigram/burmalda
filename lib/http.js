import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

const attempts = new Map();

export const production = process.env.NODE_ENV === 'production';
export const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
export const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
export const reference = (prefix) => `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 6).toUpperCase()}`;

export function json(status, payload) {
  return NextResponse.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function publicUrl(request) {
  if (production && process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

export async function body(request, limit = 65536) {
  const raw = await request.text();
  if (raw.length > limit) throw new Error('PAYLOAD_TOO_LARGE');
  return raw;
}

export async function jsonBody(request, limit) {
  const raw = await body(request, limit);
  return JSON.parse(raw || '{}');
}

export function rateLimited(request) {
  const key = text(request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown', 200);
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 40) return true;
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

export function customerPayload(input = {}) {
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

export function inquiryPayload(input) {
  const value = {
    firstName: text(input.firstName, 80), lastName: text(input.lastName, 80), email: text(input.email, 254),
    company: text(input.company, 160), interest: text(input.interest, 100), message: text(input.message, 5000),
    privacyConsent: input.privacyConsent === true || input.privacyConsent === 'true',
  };
  if (!value.firstName || !value.lastName || !value.company || !validEmail(value.email) || !value.privacyConsent) return null;
  return value;
}

export function apiError(error) {
  console.error(error);
  return json(error.message === 'PAYLOAD_TOO_LARGE' ? 413 : error instanceof SyntaxError ? 400 : 500, {
    message: error instanceof SyntaxError ? 'Invalid JSON request.' : 'The request could not be processed.',
  });
}
