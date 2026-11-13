import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { deleteSession, getUser, saveUser } from './db.js';
import { production, publicUrl, text, validEmail } from './http.js';

export const providers = { google: true, github: true };
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = () => Boolean(supabaseUrl() && supabaseKey());
export const configured = (provider) => Boolean(providers[provider] && supabaseConfigured());

async function supabase() {
  if (!supabaseConfigured()) throw new Error('Supabase Auth is not configured.');
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
}

export function loginRedirect(request, error) {
  return NextResponse.redirect(`${publicUrl(request)}/login${error ? `?error=${encodeURIComponent(error)}` : ''}`);
}

async function saveIdentity(identity) {
  if (!identity?.email) return null;
  const previous = await getUser(identity.id);
  if (previous) return previous;
  const metadata = identity.user_metadata || {};
  const email = identity.email.toLowerCase();
  const provider = identity.app_metadata?.provider || identity.identities?.[0]?.provider || 'supabase';
  const user = {
    id: identity.id, email,
    name: text(metadata.full_name || metadata.name || metadata.user_name || email.split('@')[0], 120),
    company: '', phone: '', location: '',
    avatar: metadata.avatar_url || metadata.picture || '', provider,
    createdAt: identity.created_at || new Date().toISOString(),
  };
  return saveUser(user);
}

export async function sessionUser() {
  if (!supabaseConfigured()) return null;
  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return saveIdentity(data.user);
}

export async function logout(request) {
  if (supabaseConfigured()) {
    const client = await supabase();
    await client.auth.signOut();
  }
  if (request.cookies.get('gc_session')?.value) await deleteSession(request.cookies.get('gc_session').value);
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set('gc_session', '', { path: '/', httpOnly: true, sameSite: 'lax', secure: production, maxAge: 0 });
  return response;
}

export async function startOAuth(request, provider) {
  if (!configured(provider)) return loginRedirect(request, 'provider');
  const client = await supabase();
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${publicUrl(request)}/api/auth/${provider}/callback`, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw new Error('Unable to start Supabase OAuth sign-in.');
  return NextResponse.redirect(data.url);
}

export async function completeOAuth(request, provider, input) {
  if (!configured(provider) || !input.code) return loginRedirect(request, 'oauth');
  const client = await supabase();
  const { data, error } = await client.auth.exchangeCodeForSession(input.code);
  if (error || !data.user) return loginRedirect(request, 'oauth');
  const user = await saveIdentity(data.user);
  if (!user) return loginRedirect(request, 'email');
  return NextResponse.redirect(`${publicUrl(request)}/account`);
}

function emailCredentials(input, registration = false) {
  const email = text(input.email, 254).toLowerCase();
  const password = typeof input.password === 'string' ? input.password : '';
  const name = text(input.name, 120);
  if (!validEmail(email) || password.length < 8 || password.length > 72 || (registration && !name)) return null;
  return { email, password, name };
}

export async function emailSignIn(input) {
  const credentials = emailCredentials(input);
  if (!credentials) return { error: 'Enter a valid email and a password of 8–72 characters.', status: 400 };
  const client = await supabase();
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error || !data.user) return { error: 'Incorrect email or password, or your email has not been confirmed.', status: 401 };
  const user = await saveIdentity(data.user);
  return { user };
}

export async function emailSignUp(request, input) {
  const credentials = emailCredentials(input, true);
  if (!credentials) return { error: 'Enter your name, a valid email, and a password of 8–72 characters.', status: 400 };
  const client = await supabase();
  const { data, error } = await client.auth.signUp({
    email: credentials.email, password: credentials.password,
    options: {
      data: { full_name: credentials.name },
      emailRedirectTo: `${publicUrl(request)}/api/auth/confirm`,
    },
  });
  if (error || !data.user) return { error: 'Unable to create the account. Try signing in or use another email.', status: 400 };
  const user = await saveIdentity(data.user);
  if (data.session && user) return { user };
  return { confirmationRequired: true, message: 'Check your inbox and confirm your email to finish creating your account.' };
}

export async function sendRecovery(request, input) {
  const email = text(input.email, 254).toLowerCase();
  if (!validEmail(email)) return { error: 'Enter a valid email address.', status: 400 };
  const client = await supabase();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicUrl(request)}/api/auth/confirm?type=recovery`,
  });
  if (error) return { error: 'Unable to send a recovery email right now. Please try again later.', status: 400 };
  return { message: 'If an account exists for this email, a password reset link has been sent.' };
}

export async function updatePassword(input) {
  const password = typeof input.password === 'string' ? input.password : '';
  if (password.length < 8 || password.length > 72) return { error: 'Password must contain 8–72 characters.', status: 400 };
  const client = await supabase();
  const { data, error } = await client.auth.updateUser({ password });
  if (error || !data.user) return { error: 'This recovery link is invalid or has expired. Request a new one.', status: 401 };
  return { user: await saveIdentity(data.user) };
}

export async function confirmEmail(request, input) {
  if (!supabaseConfigured() || !input.token_hash) return loginRedirect(request, 'oauth');
  const type = input.type === 'recovery' ? 'recovery' : 'email';
  const client = await supabase();
  const { data, error } = await client.auth.verifyOtp({ token_hash: input.token_hash, type });
  if (error || !data.user) return loginRedirect(request, 'oauth');
  await saveIdentity(data.user);
  return NextResponse.redirect(`${publicUrl(request)}${type === 'recovery' ? '/login?recovery=1' : '/account'}`);
}
