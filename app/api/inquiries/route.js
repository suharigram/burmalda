import { createSubmission } from '../../../lib/db.js';
import { apiError, inquiryPayload, json, jsonBody, production, rateLimited, reference } from '../../../lib/http.js';
import { deliver, deliveryConfigured } from '../../../lib/mailer.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    if (rateLimited(request)) return json(429, { message: 'Too many requests. Please wait and try again.' });
    const input = await jsonBody(request);
    if (input.website) return json(200, { received: true });
    const inquiry = inquiryPayload(input);
    if (!inquiry) return json(400, { message: 'Please check the required fields and work email.' });
    if (production && !deliveryConfigured()) return json(503, { message: 'Form delivery is not configured. Please email sales@clodlegrade.com.' });
    const requestId = reference('CLG');
    await createSubmission('inquiry', { requestId, ...inquiry });
    await deliver(
      `Clod Le Grade inquiry ${requestId}`,
      `Reference: ${requestId}\nName: ${inquiry.firstName} ${inquiry.lastName}\nEmail: ${inquiry.email}\nCompany: ${inquiry.company}\nInterest: ${inquiry.interest}\n\n${inquiry.message}`,
      inquiry.email, inquiry.email,
    );
    return json(201, { ok: true, requestId });
  } catch (error) {
    return apiError(error);
  }
}
