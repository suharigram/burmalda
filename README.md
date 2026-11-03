# GonidonCloud

React/Vite website with a Node.js API for inquiries, newsletter subscriptions, orders, and Stripe-hosted card checkout.

## Run locally

Use Node.js 22 or newer, install dependencies, configure server-only secrets in `.env`, and start both development servers:

```bash
npm install
npm run dev
```

- Website: `http://localhost:5173`
- API: `http://localhost:4173/api/health`

In development, valid inquiries and orders are stored in `data/submissions.ndjson` even when email is not configured. This directory is intentionally excluded from version control. In production, inquiry/invoice requests return a configuration error instead of pretending delivery succeeded.

## Production

Use a long-running Node.js host or VPS, not a static-only deployment. The same process serves the built site and API:

```bash
npm ci
npm run build
npm start
```

`npm start` sets `NODE_ENV=production` and listens on `0.0.0.0:4173` by default. The hosting provider can override `PORT`. Check `GET /api/health` after deployment.

Required public configuration:

| Variable | Purpose |
|---|---|
| `PUBLIC_URL` | Canonical public HTTPS origin, for example `https://gonidoncloud.com`. Used for Stripe return URLs and OAuth callbacks. |
| `PORT` | Optional internal HTTP port; defaults to `4173`. |
| `TRUST_PROXY` | Set to `true` only behind a trusted reverse proxy that sets `X-Forwarded-For`, so rate limits use client IPs rather than one shared proxy IP. |
| `SMTP_URL` + `INQUIRY_TO_EMAIL` | Team and customer email delivery. `MAIL_FROM` optionally overrides the sender. |
| `FORM_WEBHOOK_URL` | Optional additional inquiry delivery to a CRM or automation webhook. |
| `STRIPE_SECRET_KEY` | Server-only Stripe secret key; use test keys until the full payment flow is verified. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the production Stripe webhook endpoint. |

Terminate HTTPS at the hosting provider or reverse proxy and redirect HTTP to HTTPS. Production responses include HSTS and baseline security headers. Keep `.env`, API keys, and OAuth secrets in the host's secret manager; never expose them through `VITE_` variables or commit them.

Mount a persistent volume at `data/` and back it up. The included NDJSON store and in-memory OAuth sessions are a single-process foundation: restarts sign users out, and multiple replicas are not supported. Before opening accounts broadly or scaling, migrate users, orders, and sessions to a managed database and shared persistent session store, with encryption, retention/deletion policies, access logging, and tested backups.

## Form delivery

`POST /api/inquiries` validates and rate-limits submissions, ignores honeypot spam, assigns a `GC-*` reference, and persists the request. Delivery can use:

1. `SMTP_URL` + `INQUIRY_TO_EMAIL` for team notification and customer acknowledgement;
2. `FORM_WEBHOOK_URL` for Zapier, Make, a CRM, or a custom backend;
3. both simultaneously for redundancy.

`POST /api/newsletter` validates and stores subscriptions for export or synchronization with an email platform.

For a real deployment, use a managed database with encryption, retention/deletion policies, access logging, and backups instead of the included development NDJSON store.

## Payments

The server owns the product price allowlist. The browser cannot set prices or card details.

- **Card:** `POST /api/checkout` creates a Stripe-hosted Checkout Session and redirects the customer to Stripe. Configure `STRIPE_SECRET_KEY`; enable `STRIPE_AUTOMATIC_TAX` only after configuring Stripe Tax.
- **Invoice:** the same endpoint records the order and notifies sales to issue a verified pro forma invoice with final taxes, delivery, and bank instructions.
- **Fulfillment:** point a Stripe webhook to `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Set `STRIPE_WEBHOOK_SECRET`. Only webhook-confirmed orders are marked `paid`.

Before accepting real payments, configure the legal seller entity, Stripe account, tax registrations, shipping/duty policy, inventory, refunds, support ownership, and fulfillment alerts. Use Stripe test mode first.

## Accounts and downloads

The account area supports Google, Apple, and GitHub OAuth, editable profiles, order history, fulfillment status, and driver downloads. Configure the provider credentials shown in `.env.example` and register these exact callback URLs:

- `PUBLIC_URL/api/auth/google/callback`
- `PUBLIC_URL/api/auth/apple/callback`
- `PUBLIC_URL/api/auth/github/callback`

Apple requires `form_post` callback support, which the server provides. OAuth sessions use HTTP-only, SameSite cookies; production sessions also require HTTPS. The included in-memory session store is suitable for a single-server deployment only. Use shared, persistent sessions and a managed user database before scaling to multiple instances.

Authenticated checkouts are linked to the account automatically. Stripe webhooks continue to confirm payment status. Fulfillment integrations can append `order_update` records with `processing`, `shipped`, or `delivered`, plus optional `carrier` and `trackingNumber` fields. Configure the signed driver URLs in `.env.example`; unpublished packages are never presented as downloadable files.

## Legal content

The Legal & Compliance center includes original GonidonCloud drafts covering the core AMD footer policies and ecommerce requirements: privacy, terms/copyright, trademarks, cookies, privacy choices, accessibility, sale terms, EULA, trade compliance, product security, WEEE, supply chain, competition, UK tax, procurement, and partner standards.

These are product-ready drafts, not a substitute for legal advice. Counsel should adapt company registration, addresses, governing law, consumer rights, regional privacy clauses, tax disclosures, warranty periods, export classifications, and entity-specific statutory statements before launch.

## Theme and privacy

The light/dark theme follows system preference on first visit and persists in `localStorage`. Cookie preferences are stored separately. No analytics or advertising scripts are installed; consent categories are ready for a future consent-aware loader.
# burmalda
