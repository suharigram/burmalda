import { sessionUser } from '../../../../lib/auth.js';
import { apiError, json } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    return json(200, { user: await sessionUser(request) });
  } catch (error) {
    return apiError(error);
  }
}
