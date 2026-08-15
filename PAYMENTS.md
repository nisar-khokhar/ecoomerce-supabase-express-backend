# Payments Documentation

This document explains how payments work in this project, including the order-to-payment flow, supported providers, webhook handling, refund logic, and required environment variables.

---

## 1. Overview

This backend supports payment processing for orders through a provider-based architecture. The project is built to work with Stripe and also includes a second provider implementation for XPay.

The payment flow usually follows this sequence:

1. Customer creates an order from the cart.
2. Order is stored with status and total amount.
3. Frontend calls the payment initialization endpoint.
4. Provider creates a payment session or payment intent.
5. Payment completes or fails.
6. Payment status is updated on the order.
7. Webhooks confirm final state.
8. Refunds can be processed if needed.

---

## 2. Payment Model

The main payment record lives in the `payments` table.

Important fields:

- id
- order_id
- provider
- provider_payment_id
- amount
- currency
- status
- provider_response
- paid_at
- created_at
- updated_at

The order is connected to payments through `order_id`, and each payment belongs to a single order. Payment status is tracked independently from the order’s fulfillment status.

---

## 3. Supported Providers

### Stripe

Stripe is the main provider configured for payment processing.

Expected environment variables:

```env
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

The app includes provider logic in:

- services/payments/stripe.provider.js

### XPay

A second provider implementation exists for XPay-based payment processing.

Expected environment variables:

```env
XPAY_API_KEY=your-xpay-api-key
XPAY_WEBHOOK_SECRET=your-xpay-webhook-secret
```

The app includes provider logic in:

- services/payments/xpay.provider.js

---

## 4. Payment Route

Protected route:

```http
POST /api/payments/orders/:orderId
```

This endpoint creates a payment session for an order.

Example:

```bash
curl -X POST http://localhost:8000/api/payments/orders/12 \
  -H "Authorization: Bearer <token>"
```

### What it does

- loads the target order
- validates the order belongs to the current user
- chooses the configured provider
- creates the payment object
- returns a payment payload or redirect metadata

---

## 5. Provider Flow

The actual provider logic is separated into dedicated files under:

- services/payments/stripe.provider.js
- services/payments/xpay.provider.js

This keeps the project extensible and allows swapping providers without changing the order service too heavily.

Typical provider operation:

- call provider API to create payment intent/session
- receive provider payment reference ID
- store response data in `payments.provider_response`
- mark payment status as `pending`, `paid`, `failed`, etc.

---

## 6. Webhooks

Webhook endpoints are exposed for provider callbacks.

Main route:

```http
POST /api/payments/webhook
```

This route is used for asynchronous event processing from third-party payment gateways.

### Why webhooks matter

Payment success may not be instant if the provider responds asynchronously. Webhooks let the backend confirm:

- payment succeeded
- payment failed
- refund occurred
- subscription or recurring events triggered

### Security

Providers usually sign webhook requests. The project should verify the provider signature using the configured webhook secret before trusting the payload.

---

## 7. Payment Status Lifecycle

Payment records can move through multiple states.

Possible values:

- pending
- processing
- paid
- failed
- cancelled
- refunded
- partially_refunded

The order also has a separate `payment_status` field, which is used to reflect the payment state at the order level.

---

## 8. Refunds

Refunds are handled through the refund system and related service files.

The project contains refund support in:

- services/payment.service.js
- services/refund.service.js or similar refund logic modules
- routes/refund.routes.js

Refund flow may include:

- checking whether the order is refundable
- verifying payment status
- notifying the payment provider
- creating a refund record
- updating order payment status
- restoring inventory if the order is cancelled or refunded

---

## 9. Integration with Orders

The payment flow is tightly tied to the order lifecycle:

- order is created
- payment is initialized for that order
- successful payment updates order payment status
- fulfilled or cancelled orders update downstream admin and inventory logic

This means the payment layer does not work in isolation; it depends on the order state and inventory logic.

---

## 10. Example Payment Lifecycle

```text
Customer adds items to cart
  -> Creates order
  -> Calls POST /api/payments/orders/:orderId
  -> Provider returns payment reference
  -> User completes payment
  -> Provider sends webhook
  -> Backend updates payment status to paid
  -> Order payment_status is updated
```

---

## 11. Security and Production Notes

For production usage, keep these rules in mind:

- never expose Stripe secret keys in frontend code
- verify webhook signatures before processing events
- store provider responses in a secure and auditable way
- do not trust client-side payment state alone
- validate order ownership before creating a payment

---

## 12. Key Files

- app.js
- routes/payment.routes.js
- controllers/payment.controller.js
- services/payment.service.js
- services/payments/stripe.provider.js
- services/payments/xpay.provider.js
- config/supabase.js

---

## 13. Summary

This project uses a provider-based payment architecture built around orders and payment records. Stripe is the primary implementation, while XPay is also supported. Payment creation is driven by the order lifecycle, and webhook-driven confirmation ensures the system stays synchronized with the payment provider.

This setup is suitable for a production-ready e-commerce backend and supports both customer checkout and admin payment tracking.
