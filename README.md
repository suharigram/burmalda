# Clod Le Grade

Next.js website with serverless API routes for accounts, inquiries, orders, Stripe Checkout, and Supabase PostgreSQL.

## Stack

- Next.js App Router and React
- Vercel hosting and serverless functions
- Supabase PostgreSQL through the `pg` driver
- Stripe hosted Checkout
- Three.js product visuals

## Run locally

Use Node.js 22.13 or newer. Install dependencies, configure `.env`, and run the Supabase migration before starting the app:

```bash
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. The health check is available at `/api/health`.

## Supabase

Create a Supabase project and configure both its Auth API and PostgreSQL connection. Use the **Session Pooler** connection string for local development and Vercel. It is compatible with serverless functions and IPv4 networks. Do not use the direct database host on port `5432`: an `ENETUNREACH` IPv6 error means the direct connection must be replaced with the pooler host on port `6543`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:6543/postgres
PGSSL=true
PG_POOL_MAX=3
```

Run `npm run db:migrate` once for a new database. It creates profiles, legacy sessions, orders, order events, submissions, and metadata tables. Existing local SQLite or NDJSON data is imported only when those legacy files exist. Run the command against an empty destination only after verifying the intended `DATABASE_URL`.

The application uses the database password only on the server. Do not expose it through `NEXT_PUBLIC_` variables. A Supabase service-role key is not required. Supabase stores the data, so Vercel does not need a persistent volume. The publishable key is safe for browser access; server route handlers use it to validate the user's Supabase Auth session.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL used for authentication. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported. |
| `DATABASE_URL` | Required Supabase Session Pooler connection string. |
| `PGSSL` | Set to `true` for Supabase TLS connections. |
| `PG_POOL_MAX` | Optional maximum PostgreSQL connections per serverless instance; defaults to `3`. |
| `PUBLIC_URL` | Canonical public origin, for example `https://clodlegrade.com`. Used for metadata, OAuth callbacks, and Stripe return URLs. |
| `SMTP_URL` + `INQUIRY_TO_EMAIL` | Team and customer email delivery. `MAIL_FROM` optionally overrides the sender. |
| `FORM_WEBHOOK_URL` | Optional additional inquiry delivery to a CRM or automation webhook. |
| `STRIPE_SECRET_KEY` | Server-only Stripe secret key; use test keys until the payment flow is verified. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/stripe/webhook`. |
| `FPU_LINUX_DRIVER_URL`, `FPU_FIRMWARE_URL`, `FPU_SDK_URL` | Optional signed driver download URLs. |

See `.env.example` for all supported settings. Never commit `.env`, `.env.local`, database credentials, or OAuth secrets.

## Deploy to Vercel

1. Push the repository to GitHub and import it into Vercel.
2. Keep the detected **Next.js** framework preset. Build: `npm run build`. Output is managed by Next.js.
3. Add the environment variables above in **Project Settings → Environment Variables**. Use the Supabase Session Pooler URL for `DATABASE_URL` and set `PGSSL=true`.
4. Set `PUBLIC_URL` to the final HTTPS domain and deploy.
5. Run `npm run db:migrate` locally against the same Supabase project before using accounts or checkout.
6. Confirm that `/api/health` returns `"auth":"supabase"` and `"ok":true`.

For preview deployments, either leave `PUBLIC_URL` unset so callbacks use the current request origin or use a fixed production URL deliberately. Supabase Auth and Stripe webhooks must be configured for the same public domain used by the site.

## Email, Google and GitHub sign-in

1. In **Supabase Dashboard → Authentication → Sign In / Providers**, keep Email enabled and enable Google and GitHub. Enter OAuth credentials in Supabase, not in the website environment.
2. In each provider's OAuth application, set Supabase's callback URL: `https://PROJECT_REF.supabase.co/auth/v1/callback`.
3. In **Supabase → Authentication → URL Configuration**, set Site URL to `https://clodlegrade.com` and add these redirect URLs:

```text
https://clodlegrade.com/api/auth/google/callback
https://clodlegrade.com/api/auth/github/callback
https://clodlegrade.com/api/auth/confirm
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/github/callback
http://localhost:3000/api/auth/confirm
```

Email sign-up, password sign-in, email confirmation, and password recovery are available at `/login`. For production email delivery, configure SMTP in **Supabase → Authentication → SMTP**; the built-in email service is intended only for development and has strict rate limits.

The website uses Supabase's PKCE flow and HttpOnly session cookies. Authentication and password hashes are handled by Supabase Auth; profiles and orders are stored in the site's public PostgreSQL tables. Passwords are never written to the public `users` table. Apple sign-in is not available.

## Stripe

Configure a Stripe webhook for `/api/stripe/webhook` with `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Stripe success and cancellation routes use normal Next.js paths such as `/order/success/ORDER_ID`.

Production forms require SMTP or a form webhook. Inquiries, invoice orders, and payments are validated on the server. Prices are owned by the server-side catalog, not supplied by the browser.

## Useful commands

```bash
npm run dev         # Next.js development server
npm run build       # Production build
npm start           # Serve the production build locally
npm run db:migrate  # Create or migrate the Supabase schema
```
