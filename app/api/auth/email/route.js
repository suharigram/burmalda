import { emailSignIn, emailSignUp } from '../../../../lib/auth.js';
import { apiError, json, jsonBody, rateLimited } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (rateLimited(request)) return json(429, { message: 'Too many attempts. Please wait and try again.' });
    const input = await jsonBody(request);
    const result = input.action === 'signup'
      ? await emailSignUp(request, input)
      : input.action === 'signin'
        ? await emailSignIn(input)
        : { error: 'Unknown authentication action.', status: 400 };
    const { status = 200, ...payload } = result;
    return json(status, payload);
  } catch (error) {
    return apiError(error);
  }
}
