# Stripe Integration TODO

## Values to Replace

No `sample_only` placeholders remain in the Checkout Session call. Existing one-time payment mode, product line items, success URL, and cancel URL were preserved and converted to Next.js routes.

Before accepting payments, configure the local or deployment environment:

| Environment variable | What to Set |
|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe secret API key. Use `sk_test_...` during development and a live key only for production. |
| `STRIPE_WEBHOOK_SECRET` | The signing secret for the configured Stripe webhook (`whsec_...`). |
| `PUBLIC_URL` | The public origin of the site, for example `http://localhost:3000` locally or `https://mindpick.com` in production. |
| `DATABASE_URL` | The Supabase Session Pooler connection string used to create and update orders. |
| `PGSSL` | Set to `true` for Supabase TLS connections. |

These are server-only variables. Do not give them a `NEXT_PUBLIC_` prefix, commit `.env`, or expose secret keys in browser code.

## Configured Parameters

**Files containing these parameters:**
- [lib/stripe.js](lib/stripe.js)
- [app/api/checkout/route.js](app/api/checkout/route.js)
- [app/api/stripe/webhook/route.js](app/api/stripe/webhook/route.js)

| Parameter | Value |
|---|---|
| `ui_mode` | `hosted_page` |
| `mode` | `payment` |
| `billing_address_collection` | `auto` |
| `phone_number_collection[enabled]` | `false` |
| `automatic_tax[enabled]` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

`payment_method_collection` is intentionally omitted because `mode` is `payment`; it applies only to subscription mode. The integration uses the Stripe REST API and does not require a Stripe SDK.

## Setup and Next Steps

1. Add the environment variables above to `.env` locally and to Vercel Project Settings for deployment.
2. Run `npm run db:migrate` against Supabase before testing checkout.
3. In Stripe Dashboard, configure a webhook pointing to `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
4. Start the project with `npm run dev`. Vercel runs the same route handlers as serverless functions.
5. The checkout flow validates the order, creates a hosted Stripe Checkout Session, and redirects the customer to Stripe. The internal `orderId` is attached to both Session and PaymentIntent metadata, and the customer email is passed to Stripe.
6. Returning to `/order/success/ORDER_ID` does not mark an order as paid. Only a verified `checkout.session.completed` event with `payment_status=paid`, or `checkout.session.async_payment_succeeded`, confirms payment and reserves the allocation.
7. Test in Stripe test mode before enabling live payments. Stripe's standard successful test card is `4242 4242 4242 4242`, with a future expiration date and any three-digit CVC.
8. Verify the full flow, including webhook signature validation and order status in Supabase. Update product pricing in `src/commerceData.js`; the server owns the price allowlist.
9. Configure fulfillment notifications, refunds, tax treatment, delivery policies, and production order tracking before going live.

Resources: https://support.stripe.com and https://docs.stripe.com/mcp
