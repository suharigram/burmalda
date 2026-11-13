import { databaseHealthy } from '../../../lib/db.js';
import { supabaseConfigured } from '../../../lib/auth.js';
import { json } from '../../../lib/http.js';
import { deliveryConfigured } from '../../../lib/mailer.js';

export const runtime = 'nodejs';

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const authConfigured = supabaseConfigured();
  const status = {
    database: 'supabase-postgresql', databaseConfigured, auth: 'supabase', authConfigured,
    emailDelivery: deliveryConfigured(), cardPayments: Boolean(process.env.STRIPE_SECRET_KEY),
  };
  if (!databaseConfigured) return json(503, { ok: false, ...status });
  try {
    const databaseReady = await databaseHealthy();
    const ok = databaseReady && authConfigured;
    return json(ok ? 200 : 503, { ok, ...status, databaseReady });
  } catch (error) {
    console.error('Supabase database health check failed:', error.code || error.message);
    return json(503, { ok: false, ...status, databaseReady: false });
  }
}
