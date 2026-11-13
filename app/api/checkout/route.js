import { randomUUID } from 'node:crypto';
import { sessionUser } from '../../../lib/auth.js';
import { getCatalogItem } from '../../../src/commerceData.js';
import { createOrder, updateOrder } from '../../../lib/db.js';
import { apiError, customerPayload, json, jsonBody, production, publicUrl, rateLimited, reference, text } from '../../../lib/http.js';
import { deliver, deliveryConfigured } from '../../../lib/mailer.js';
import { createStripeSession } from '../../../lib/stripe.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (rateLimited(request)) return json(429, { message: 'Too many requests. Please wait and try again.' });
    const input = await jsonBody(request);
    if (input.website) return json(200, { received: true });
    const item = getCatalogItem(text(input.productId, 60));
    const quantity = Number(input.quantity);
    const customer = customerPayload(input.customer);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > item.maxQuantity || !customer) {
      return json(400, { message: 'Please check the product, quantity, customer details, and required agreements.' });
    }
    if (customer.paymentMethod === 'invoice' && production && !deliveryConfigured()) {
      return json(503, { message: 'Invoice delivery is not configured. Please contact orders@mindpick.com.' });
    }
    const orderId = randomUUID();
    const orderReference = reference('MP-ORD');
    const order = {
      orderId, reference: orderReference, productId: item.id, productName: item.name,
      quantity, total: item.unitAmount * quantity, currency: item.currency,
      status: customer.paymentMethod === 'invoice' ? 'awaiting_invoice' : 'pending_payment',
      customer, userId: (await sessionUser(request))?.id || null,
    };
    await createOrder(order);
    if (customer.paymentMethod === 'invoice') {
      await deliver(`Pre-order invoice ${orderReference}`, JSON.stringify(order, null, 2), customer.email, customer.email);
      return json(201, { ok: true, orderId, reference: orderReference, status: 'awaiting_invoice' });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return json(503, { message: 'Card payments are not configured in this environment. Choose a pro forma invoice or contact sales.' });
    }
    try {
      const session = await createStripeSession(order, item, quantity, customer, publicUrl(request));
      await updateOrder(orderId, { status: 'checkout_created', stripeSessionId: session.id });
      return json(201, { checkoutUrl: session.url, orderId });
    } catch (error) {
      console.error('Stripe Checkout failed:', error.message);
      await updateOrder(orderId, { status: 'checkout_failed' });
      return json(502, { message: 'Secure card checkout is temporarily unavailable. Choose a pro forma invoice or try again later.' });
    }
  } catch (error) {
    return apiError(error);
  }
}
