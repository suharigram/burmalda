import { createHmac, timingSafeEqual } from 'node:crypto';

export async function createStripeSession(order, item, quantity, customer, origin) {
  const params = new URLSearchParams({
    ui_mode: 'hosted_page', mode: 'payment',
    success_url: `${origin}/order/success/${order.orderId}`, cancel_url: `${origin}/order/cancelled/${order.orderId}`,
    'line_items[0][quantity]': String(quantity),
    'line_items[0][price_data][currency]': item.currency, 'line_items[0][price_data][unit_amount]': String(item.unitAmount),
    'line_items[0][price_data][product_data][name]': `Pre-order · ${item.name}`,
    'line_items[0][price_data][product_data][description]': `${item.description} Expected to ship Q1 2027.`,
    billing_address_collection: 'auto', 'phone_number_collection[enabled]': 'false', 'automatic_tax[enabled]': 'false',
    allow_promotion_codes: 'false', submit_type: 'auto', integration_identifier: 'hosted_web_0001', origin_context: 'web',
    customer_email: customer.email, 'metadata[orderId]': order.orderId, 'payment_intent_data[metadata][orderId]': order.orderId,
  });
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': order.orderId,
    },
    body: params,
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Stripe Checkout failed');
  return result;
}

export function verifyStripe(raw, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${parts.t}.${raw}`).digest('hex');
  const a = Buffer.from(parts.v1);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
}
