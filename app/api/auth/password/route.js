import { updatePassword } from '../../../../lib/auth.js';
import { apiError, json, jsonBody, rateLimited } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (rateLimited(request)) return json(429, { message: 'Too many attempts. Please wait and try again.' });
    const result = await updatePassword(await jsonBody(request));
    const { status = 200, ...payload } = result;
    return json(status, payload);
  } catch (error) {
    return apiError(error);
  }
}
