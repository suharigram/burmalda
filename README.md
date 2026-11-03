# GonidonCloud

React/Vite website with a Node.js API for inquiries, newsletter subscriptions, orders, and Stripe-hosted card checkout.

## Run locally

Use Node.js 22.13 or newer and a running PostgreSQL server. Install dependencies, set `DATABASE_URL` and other server-only secrets in `.env`, then start both development servers:

```bash
npm install
npm run dev
```

- Website: `http://localhost:5173`
- API: `http://localhost:4173/api/health`

Users, sessions, orders, inquiries, and newsletter subscriptions are stored in PostgreSQL. The schema is created automatically on startup. On the first run, existing `data/gonidoncloud.db` records are imported into PostgreSQL; if that file is absent, legacy `data/submissions.ndjson` records are imported instead. Source files are kept unchanged as backups, and the entire `data/` directory is excluded from version control. In production, inquiry/invoice requests return a configuration error instead of pretending delivery succeeded.

To run the data migration without starting the website:

```bash
npm run db:migrate
```

## Production

Use a long-running Node.js host or VPS, not a static-only deployment. The same process serves the built site and API:

```bash
npm ci
npm run build
npm start
```

`npm start` sets `NODE_ENV=production` and listens on `0.0.0.0:4173` by default. The hosting provider can override `PORT`. Check `GET /api/health` after deployment. The application will not start without a valid `DATABASE_URL`.

Required public configuration:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Required PostgreSQL connection string. On Railway, reference the PostgreSQL service variable instead of copying its credentials. |
| `PGSSL` | Optional; set to `true` only when the PostgreSQL provider requires SSL. Do not enable it for Railway's internal private connection unless required. |
| `PUBLIC_URL` | Canonical public HTTPS origin, for example `https://gonidoncloud.com`. Used for Stripe return URLs and OAuth callbacks. |
| `PORT` | Optional internal HTTP port; defaults to `4173`. |
| `TRUST_PROXY` | Set to `true` only behind a trusted reverse proxy that sets `X-Forwarded-For`, so rate limits use client IPs rather than one shared proxy IP. |
| `SMTP_URL` + `INQUIRY_TO_EMAIL` | Team and customer email delivery. `MAIL_FROM` optionally overrides the sender. |
| `FORM_WEBHOOK_URL` | Optional additional inquiry delivery to a CRM or automation webhook. |
| `STRIPE_SECRET_KEY` | Server-only Stripe secret key; use test keys until the full payment flow is verified. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the production Stripe webhook endpoint. |
| `SQLITE_PATH` | Optional path to the legacy SQLite file used only for the one-time import; defaults to `data/gonidoncloud.db`. |

Terminate HTTPS at the hosting provider or reverse proxy and redirect HTTP to HTTPS. Production responses include HSTS and baseline security headers. Keep `.env`, API keys, database credentials, and OAuth secrets in the host's secret manager; never expose them through `VITE_` variables or commit them.

## Railway PostgreSQL

PostgreSQL uses parameterized queries, transactions, foreign keys, and indexes. Users, persistent login sessions, orders, order events, and form submissions survive deployments and process restarts. Railway's managed PostgreSQL service stores the data, so the web service does **not** need a persistent volume for the database.

To deploy on **Railway**:

1. Create a project and deploy the web service from the GitHub repository.
2. Set the build command to `npm ci && npm run build` and the start command to `npm start`.
3. Add **PostgreSQL** to the same project.
4. In the web service, add a Variable Reference named `DATABASE_URL` that references `DATABASE_URL` from the PostgreSQL service.
5. Set `PUBLIC_URL` to the public HTTPS site URL and configure the other required secrets.
6. Deploy and confirm that `GET /api/health` returns `"database":"postgresql"`.

Enable managed PostgreSQL backups and test restoring a backup before accepting customer orders. Do not paste the database connection string into source control or browser-accessible variables.

To import an existing local `data/gonidoncloud.db` into Railway, temporarily set `DATABASE_URL` locally to Railway's **public** PostgreSQL connection URL and run `npm run db:migrate` from the project root. The import runs only once per target database. Keep the source SQLite file in place until the imported users and orders have been verified, and never publish the connection URL.

## Form delivery

`POST /api/inquiries` validates and rate-limits submissions, ignores honeypot spam, assigns a `GC-*` reference, and persists the request. Delivery can use:

1. `SMTP_URL` + `INQUIRY_TO_EMAIL` for team notification and customer acknowledgement;
2. `FORM_WEBHOOK_URL` for Zapier, Make, a CRM, or a custom backend;
3. both simultaneously for redundancy.

`POST /api/newsletter` validates and stores subscriptions for export or synchronization with an email platform.

Apply appropriate encryption, retention/deletion policies, access logging, and backups to customer data. Managed database backups and restricted database access protect stored data; HTTPS protects it in transit.

## Payments

The server owns the product price allowlist. The browser cannot set prices or card details.

- **Card:** `POST /api/checkout` creates a Stripe-hosted Checkout Session and redirects the customer to Stripe. Configure `STRIPE_SECRET_KEY`; enable `STRIPE_AUTOMATIC_TAX` only after configuring Stripe Tax.
- **Invoice:** the same endpoint records the order and notifies sales to issue a verified pro forma invoice with final taxes, delivery, and bank instructions.
- **Fulfillment:** point a Stripe webhook to `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Set `STRIPE_WEBHOOK_SECRET`. Only webhook-confirmed orders are marked `paid`.

Before accepting real payments, configure the legal seller entity, Stripe account, tax registrations, shipping/duty policy, inventory, refunds, support ownership, and fulfillment alerts. Use Stripe test mode first.

## Accounts and downloads

The account area supports Google, Apple, and GitHub OAuth, editable profiles, order history, fulfillment status, and driver downloads. Configure `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID` with Apple credentials, and `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` in the server environment. Register these exact callback URLs:

- `PUBLIC_URL/api/auth/google/callback`
- `PUBLIC_URL/api/auth/apple/callback`
- `PUBLIC_URL/api/auth/github/callback`

Apple requires `form_post` callback support, which the server provides. OAuth sessions use HTTP-only, SameSite cookies; production sessions also require HTTPS. Sessions are stored in PostgreSQL for seven days and survive application restarts.

Authenticated checkouts are linked to the account automatically. Stripe webhooks confirm payment status without duplicating customer notifications on retries. Fulfillment integrations can call `await updateOrder(...)` from `server/database.js` with `processing`, `shipped`, or `delivered`, plus optional `carrier` and `trackingNumber` fields. Configure signed driver URLs with `FPU_LINUX_DRIVER_URL`, `FPU_FIRMWARE_URL`, and `FPU_SDK_URL`; unpublished packages are never presented as downloadable files.

## Legal content

The Legal & Compliance center includes original GonidonCloud drafts covering the core AMD footer policies and ecommerce requirements: privacy, terms/copyright, trademarks, cookies, privacy choices, accessibility, sale terms, EULA, trade compliance, product security, WEEE, supply chain, competition, UK tax, procurement, and partner standards.

These are product-ready drafts, not a substitute for legal advice. Counsel should adapt company registration, addresses, governing law, consumer rights, regional privacy clauses, tax disclosures, warranty periods, export classifications, and entity-specific statutory statements before launch.

## Theme and privacy

The light/dark theme follows system preference on first visit and persists in `localStorage`. Cookie preferences are stored separately. No analytics or advertising scripts are installed; consent categories are ready for a future consent-aware loader.
# burmalda
