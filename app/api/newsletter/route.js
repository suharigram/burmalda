import { createSubmission } from '../../../lib/db.js';
import { apiError, json, jsonBody, rateLimited, text, validEmail } from '../../../lib/http.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (rateLimited(request)) return json(429, { message: 'Too many requests. Please wait and try again.' });
    const input = await jsonBody(request);
    if (input.website) return json(200, { received: true });
    const email = text(input.email, 254);
    if (!validEmail(email)) return json(400, { message: 'Enter a valid work email.' });
    await createSubmission('newsletter', { email, source: 'website-footer' });
    return json(201, { ok: true });
  } catch (error) {
    return apiError(error);
  }
}
