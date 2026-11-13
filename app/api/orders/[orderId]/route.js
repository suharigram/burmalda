import { getOrder } from '../../../../lib/db.js';
import { apiError, json } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const order = await getOrder((await params).orderId);
    if (!order) return json(404, { message: 'Order not found.' });
    return json(200, { orderId: order.orderId, reference: order.reference, status: order.status, total: order.total, currency: order.currency });
  } catch (error) {
    return apiError(error);
  }
}
