import { configured, providers, supabaseConfigured } from '../../../../lib/auth.js';
import { json } from '../../../../lib/http.js';

export const runtime = 'nodejs';

export async function GET() {
  return json(200, {
    providers: Object.keys(providers).filter(configured),
    email: supabaseConfigured(),
  });
}
