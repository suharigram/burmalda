import { sessionUser } from '../../../../lib/auth.js';
import { listOrders } from '../../../../lib/db.js';
import { apiError, json } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const user = await sessionUser(request);
    if (!user) return json(401, { message: 'Sign in to access your account.' });
    return json(200, { orders: await listOrders(user.id) });
  } catch (error) {
    return apiError(error);
  }
}
