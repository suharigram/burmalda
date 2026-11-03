# Stripe Integration TODO

## Values to Replace

No `sample_only` placeholders remain in the Checkout Session call. Existing one-time payment mode, product line items, success URL, and cancel URL were preserved.

Before accepting payments, configure the local or deployment environment:

| Environment variable | What to Set |
|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe secret API key. Use `sk_test_...` during development and a live key only for production. |
| `STRIPE_WEBHOOK_SECRET` | The signing secret for the configured Stripe webhook (`whsec_...`). |
| `PUBLIC_URL` | The public origin of the site, for example `http://localhost:5173` locally or `https://gonidoncloud.com` in production. |

These server-only variables must not receive a Vite `VITE_` prefix. Do not commit `.env` or expose secret keys in browser code.

## Configured Parameters

**File containing these parameters:**
- [server/index.mjs](server/index.mjs)

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

`payment_method_collection` is intentionally omitted because `mode` is `payment`; it applies only to subscription mode. The integration uses the Stripe REST API and does not have an installed Stripe SDK. `hosted_page` follows the requested default for an undetermined SDK version; if an SDK below 21.0.0 is introduced later, use `hosted` instead.

## Setup and Next Steps

1. Add the environment variables above to `.env` or the production secret manager. The existing server loads `.env` automatically.
2. No additional Stripe package is required: the existing endpoint uses the Stripe REST API.
3. In Stripe Dashboard, configure a webhook pointing to `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
4. Start the project with `npm run dev`. For production, run `npm run build` and `npm start`.
5. The checkout flow validates the order, creates a hosted Stripe Checkout Session, and redirects the customer to Stripe. The internal `orderId` is attached to both Session and PaymentIntent metadata, and the customer email is passed to Stripe. Stripe returns the customer to the preserved success or cancel route.
6. Returning to the success route does not mark an order as paid. Only a verified `checkout.session.completed` event with `payment_status=paid`, or `checkout.session.async_payment_succeeded`, confirms payment and reserves the allocation.
7. Test in Stripe test mode before enabling live payments. Stripe's standard successful test card is `4242 4242 4242 4242`, with a future expiration date and any three-digit CVC.
8. Verify the full flow, including webhook signature validation and order status. Update product pricing in the existing catalog when needed; the server owns the price allowlist.
9. Configure fulfillment notifications, refunds, tax treatment, delivery policies, and production order tracking before going live.

Resources: https://support.stripe.com and https://docs.stripe.com/mcp
