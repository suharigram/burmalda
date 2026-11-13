import { logout } from '../../../../lib/auth.js';
import { apiError } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    return await logout(request);
  } catch (error) {
    return apiError(error);
  }
}
