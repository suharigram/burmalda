import { loginRedirect, startOAuth } from '../../../../lib/auth.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    return await startOAuth(request, (await params).provider);
  } catch (error) {
    console.error('OAuth start failed:', error.message);
    return loginRedirect(request, 'oauth');
  }
}
