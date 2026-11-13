import { confirmEmail, loginRedirect } from '../../../../lib/auth.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    return await confirmEmail(request, Object.fromEntries(new URL(request.url).searchParams));
  } catch (error) {
    console.error('Email confirmation failed:', error.message);
    return loginRedirect(request, 'oauth');
  }
}
