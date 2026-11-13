import { getOrder, updateOrder } from '../../../../lib/db.js';
import { apiError, body, json } from '../../../../lib/http.js';
import { deliver } from '../../../../lib/mailer.js';
import { verifyStripe } from '../../../../lib/stripe.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const raw = await body(request, 1024 * 1024);
    if (!verifyStripe(raw, request.headers.get('stripe-signature'))) return json(400, { message: 'Invalid webhook signature.' });
    const event = JSON.parse(raw);
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const order = await getOrder(session.metadata?.orderId);
      const paymentConfirmed = event.type === 'checkout.session.async_payment_succeeded' || session.payment_status === 'paid';
      if (order && paymentConfirmed) {
        await updateOrder(order.orderId, {
          status: 'paid', stripeSessionId: session.id, paymentStatus: session.payment_status,
          eventType: 'payment', id: event.id,
        });
        if (order.status !== 'paid') {
          await deliver(
            `Paid pre-order ${order.orderId}`,
            `Stripe Checkout completed.\nPre-order: ${order.orderId}\nSession: ${session.id}\nAmount: ${session.amount_total} ${session.currency}`,
            session.customer_email,
          );
        }
      }
    }
    return json(200, { received: true });
  } catch (error) {
    return apiError(error);
  }
}
