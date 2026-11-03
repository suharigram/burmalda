import { createPrivateKey, randomBytes, randomUUID, sign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const sessions = new Map();
const oauthStates = new Map();
const providers = {
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token',
    user: 'https://openidconnect.googleapis.com/v1/userinfo', scope: 'openid email profile',
  },
  github: {
    authorize: 'https://github.com/login/oauth/authorize', token: 'https://github.com/login/oauth/access_token',
    user: 'https://api.github.com/user', scope: 'read:user user:email',
  },
  apple: {
    authorize: 'https://appleid.apple.com/auth/authorize', token: 'https://appleid.apple.com/auth/token',
    scope: 'name email',
  },
};
const base64url = (value) => Buffer.from(value).toString('base64url');
const cookies = (request) => Object.fromEntries((request.headers.cookie || '').split(';').map((part) => part.trim().split('=')).filter(([key, value]) => key && value));
const cookie = (name, value, production, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${production ? '; Secure' : ''}`;
const redirect = (response, location, headers = {}) => { response.writeHead(302, { Location: location, ...headers }); response.end(); };
const configured = (provider) => Boolean(process.env[`${provider.toUpperCase()}_CLIENT_ID`] && (provider === 'apple' ? process.env.APPLE_CLIENT_SECRET || (process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) : process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]));

function appleSecret() {
  if (process.env.APPLE_CLIENT_SECRET) return process.env.APPLE_CLIENT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: process.env.APPLE_KEY_ID, typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iss: process.env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: process.env.APPLE_CLIENT_ID }));
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), { key: createPrivateKey(process.env.APPLE_PRIVATE_KEY.replaceAll('\\n', '\n')), dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${signature.toString('base64url')}`;
}

async function providerUser(provider, tokens) {
  if (provider === 'apple') {
    const claims = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
    return { id: claims.sub, email: claims.email, name: '', avatar: '', verified: claims.email_verified !== 'false' };
  }
  const response = await fetch(providers[provider].user, { headers: { Authorization: `Bearer ${tokens.access_token}`, 'User-Agent': 'GonidonCloud', Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Unable to verify your account.');
  const profile = await response.json();
  if (provider === 'google') return { id: profile.sub, email: profile.email, name: profile.name, avatar: profile.picture, verified: profile.email_verified === true };
  let email = profile.email;
  if (!email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${tokens.access_token}`, 'User-Agent': 'GonidonCloud', Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
    const emails = await emailResponse.json();
    email = emails.find((item) => item.primary && item.verified)?.email;
  }
  return { id: String(profile.id), email, name: profile.name || profile.login, avatar: profile.avatar_url, verified: Boolean(email) };
}

export function sessionUser(request) {
  const id = cookies(request).gc_session;
  const session = id && sessions.get(id);
  if (!session || session.expires < Date.now()) { if (id) sessions.delete(id); return null; }
  return session.user;
}

export async function authApi(request, response, url, helpers) {
  const { json, body, persist, publicUrl, production, text } = helpers;
  const path = url.pathname;
  if (request.method === 'GET' && path === '/api/auth/providers') return json(response, 200, { providers: Object.keys(providers).filter(configured) });
  if (request.method === 'GET' && path === '/api/auth/me') return json(response, 200, { user: sessionUser(request) });
  if (request.method === 'POST' && path === '/api/auth/logout') {
    sessions.delete(cookies(request).gc_session);
    response.setHeader('Set-Cookie', cookie('gc_session', '', production, 0));
    return json(response, 200, { ok: true });
  }
  const start = path.match(/^\/api\/auth\/(google|github|apple)$/);
  if (request.method === 'GET' && start) {
    const provider = start[1];
    if (!configured(provider)) return redirect(response, `${publicUrl}/#/login?error=provider`);
    const state = randomBytes(24).toString('base64url');
    oauthStates.set(state, { provider, expires: Date.now() + 600000 });
    const callback = `${publicUrl}/api/auth/${provider}/callback`;
    const params = new URLSearchParams({ client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`], redirect_uri: callback, response_type: 'code', scope: providers[provider].scope, state });
    if (provider === 'apple') params.set('response_mode', 'form_post');
    response.setHeader('Set-Cookie', cookie('gc_oauth_state', state, production, 600));
    return redirect(response, `${providers[provider].authorize}?${params}`);
  }
  const callback = path.match(/^\/api\/auth\/(google|github|apple)\/callback$/);
  if (callback && (request.method === 'GET' || (callback[1] === 'apple' && request.method === 'POST'))) {
    const provider = callback[1];
    const input = request.method === 'POST' ? Object.fromEntries(new URLSearchParams((await body(request)).toString())) : Object.fromEntries(url.searchParams);
    const savedState = oauthStates.get(input.state);
    if (!savedState || savedState.provider !== provider || savedState.expires < Date.now() || cookies(request).gc_oauth_state !== input.state || !input.code) return redirect(response, `${publicUrl}/#/login?error=oauth`);
    oauthStates.delete(input.state);
    const params = new URLSearchParams({ client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`], client_secret: provider === 'apple' ? appleSecret() : process.env[`${provider.toUpperCase()}_CLIENT_SECRET`], code: input.code, grant_type: 'authorization_code', redirect_uri: `${publicUrl}/api/auth/${provider}/callback` });
    const tokenResponse = await fetch(providers[provider].token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: params, signal: AbortSignal.timeout(15000) });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error('OAuth token exchange failed.');
    const identity = await providerUser(provider, tokens);
    if (!identity.email || !identity.verified) return redirect(response, `${publicUrl}/#/login?error=email`);
    const suppliedName = provider === 'apple' && input.user ? JSON.parse(input.user).name : null;
    const id = `${provider}:${identity.id}`;
    const records = (await readFile(helpers.storeFile, 'utf8').catch(() => '')).split('\n').filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
    const previous = records.filter((record) => record.id === id && (record.type === 'account' || record.type === 'profile')).at(-1);
    const user = { id, email: identity.email.toLowerCase(), name: text(suppliedName ? `${suppliedName.firstName || ''} ${suppliedName.lastName || ''}` : identity.name, 120) || identity.email.split('@')[0], company: '', phone: '', location: '', ...previous, avatar: identity.avatar || previous?.avatar || '', provider };
    await persist('account', user);
    const sessionId = randomUUID() + randomBytes(24).toString('hex');
    sessions.set(sessionId, { user, expires: Date.now() + 7 * 86400000 });
    response.setHeader('Set-Cookie', [cookie('gc_session', sessionId, production, 604800), cookie('gc_oauth_state', '', production, 0)]);
    return redirect(response, `${publicUrl}/#/account`);
  }
  const user = sessionUser(request);
  if (!user) return json(response, 401, { message: 'Sign in to access your account.' });
  if (path === '/api/account/profile' && request.method === 'PATCH') {
    const input = JSON.parse((await body(request)).toString() || '{}');
    const updated = { ...user, name: text(input.name, 120), company: text(input.company, 160), phone: text(input.phone, 40), location: text(input.location, 120), updatedAt: new Date().toISOString() };
    if (!updated.name) return json(response, 400, { message: 'Name is required.' });
    const session = sessions.get(cookies(request).gc_session); session.user = updated;
    await persist('profile', updated);
    return json(response, 200, { user: updated });
  }
  if (path === '/api/account/orders' && request.method === 'GET') {
    const records = (await readFile(helpers.storeFile, 'utf8').catch(() => '')).split('\n').filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
    const orders = records.filter((record) => record.type === 'order' && record.userId === user.id).map((order) => {
      const current = records.filter((record) => record.orderId === order.orderId).reduce((value, record) => ({ ...value, ...record }), order);
      return { orderId: order.orderId, reference: order.reference, productName: order.productName, quantity: order.quantity, total: order.total, currency: order.currency, status: current.status, createdAt: order.createdAt, trackingNumber: current.trackingNumber || '', carrier: current.carrier || '' };
    }).reverse();
    return json(response, 200, { orders });
  }
  if (path === '/api/account/downloads' && request.method === 'GET') {
    const downloads = [
      { id: 'fpu-linux', name: 'FPU 1100 Linux Driver', version: '1.0.0', platform: 'Linux · Ubuntu 24.04 / RHEL 9', size: '480 MB', url: process.env.FPU_LINUX_DRIVER_URL || '' },
      { id: 'fpu-firmware', name: 'FPU Platform Firmware', version: '2.4.1', platform: 'FPU Apollon 1100 · FlowSystem R systems', size: '86 MB', url: process.env.FPU_FIRMWARE_URL || '' },
      { id: 'fpu-sdk', name: 'FPU 1100 Developer SDK', version: '1.2.0', platform: 'Linux · x86_64', size: '1.2 GB', url: process.env.FPU_SDK_URL || '' },
    ];
    return json(response, 200, { downloads });
  }
  return json(response, 404, { message: 'Account route not found.' });
}
