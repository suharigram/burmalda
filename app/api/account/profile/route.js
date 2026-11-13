import { sessionUser } from '../../../../lib/auth.js';
import { saveUser } from '../../../../lib/db.js';
import { apiError, json, jsonBody, text } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function PATCH(request) {
  try {
    const user = await sessionUser(request);
    if (!user) return json(401, { message: 'Sign in to access your account.' });
    const input = await jsonBody(request);
    const updated = {
      ...user, name: text(input.name, 120), company: text(input.company, 160),
      phone: text(input.phone, 40), location: text(input.location, 120), updatedAt: new Date().toISOString(),
    };
    if (!updated.name) return json(400, { message: 'Name is required.' });
    await saveUser(updated);
    return json(200, { user: updated });
  } catch (error) {
    return apiError(error);
  }
}
