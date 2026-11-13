import { completeOAuth, loginRedirect, providers } from '../../../../../lib/auth.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const provider = (await params).provider;
  if (!providers[provider]) return loginRedirect(request, 'provider');
  try {
    return await completeOAuth(request, provider, Object.fromEntries(new URL(request.url).searchParams));
  } catch (error) {
    console.error('OAuth callback failed:', error.message);
    return loginRedirect(request, 'oauth');
  }
}
