# Payments

The default is a local simulator. On the checkout page choose success, failure or cancellation. Simulation is stored separately from Stripe test, and the paid ZIP appears in Downloads only after the server records a paid state.

## Stripe test setup

1. In a Stripe test environment, set `STRIPE_SECRET_KEY` to the test secret and `STRIPE_WEBHOOK_SECRET` to the endpoint signing secret. Test keys remain server-side.
2. Set each desired product’s EUR and RON minor-unit price in `.env.local`. The seeded IDs are CLEANUP, FORMATTING, REPORTING and BUILDER. For new catalog items, uppercase the slug and replace hyphens with underscores. Both currency prices are required for that offering to start Stripe test checkout.
3. Run blen. on loopback. Configure Stripe CLI forwarding in the test account to `http://127.0.0.1:3000/api/stripe/webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` and `charge.refunded`. Use the signing secret produced for that forwarding session.
4. Create an order with Stripe’s test payment methods. Verify the webhook marks the order paid, then test cancellation, async failure, retries and full refunds. Configure this only for a disposable test setup.

The webhook verifies the raw-body signature, rejects live events, checks order references and server-side amount/currency, and records event IDs within the order-update transaction. Paid state survives stale failed events. A full refund revokes future downloads by making refunded state terminal. Partial refunds and disputes require business rules and integration coverage before launch.

The return page reads server state. A browser redirect alone cannot unlock files. Test checkout and simulation are development-only. Invoice state defaults to pending configuration. There is no invoice issuance or e-Factura adapter.

See [Stripe’s Checkout fulfillment guide](https://docs.stripe.com/checkout/fulfillment).
