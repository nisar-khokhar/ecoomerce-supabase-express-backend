# Node Express E-commerce API

A complete backend for a modern e-commerce platform built with Node.js, Express, Supabase, JWT authentication, Stripe-ready payment flows, and admin controls. This project includes catalog management, customer account features, cart, checkout, order processing, reviews, and dashboard analytics.

## Copyright

Copyright (c) 2026 Malik Nisar Khokhar
All rights reserved.

This project is protected by a commercial licensing model. It is not released under an open-source permissive license. See the [LICENSE](LICENSE) file for full terms.

## Project Overview

This application is designed as a production-ready backend for a storefront and admin dashboard. It follows a modular service-oriented architecture and keeps business logic separated from HTTP controllers and route definitions.

### Core technologies

- Node.js
- Express.js
- Supabase Postgres
- JWT authentication
- Zod request validation
- Stripe payment integration
- Helmet, CORS, rate limiting, error middleware

### Main capabilities

- Customer registration and login
- User profile and password management
- Address management with default address support
- Product, category, brand, and variant catalog APIs
- Wishlist management
- Cart management with add, update, remove, and clear actions
- Order creation based on cart contents
- Payment initialization and webhook support
- Customer reviews and moderation support
- Admin inventory, dashboard, reporting, and coupon operations

---

## Tech Stack

| Layer       | Technology                  |
| ----------- | --------------------------- |
| Runtime     | Node.js                     |
| Framework   | Express.js                  |
| Database    | Supabase Postgres           |
| Auth        | JWT                         |
| Validation  | Zod                         |
| Payment     | Stripe                      |
| Security    | Helmet, CORS, rate limiting |
| Dev tooling | Nodemon                     |

---

## Project Structure

```text
Node_Express_CRUD/
├── app.js
├── package.json
├── README.md
├── .env
├── .env.example
├── .env.local
├── bin/
│   └── www
├── config/
│   └── supabase.js
├── controllers/
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── product.controller.js
│   ├── user.controller.js
│   ├── review.controller.js
│   └── ...
├── routes/
│   ├── auth.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   ├── product.routes.js
│   ├── user.routes.js
│   ├── review.routes.js
│   └── ...
├── services/
│   ├── auth.service.js
│   ├── cart.service.js
│   ├── order.service.js
│   ├── payment.service.js
│   ├── product.service.js
│   └── ...
├── validators/
│   ├── auth.validator.js
│   ├── cart.validator.js
│   ├── order.validator.js
│   ├── product.validator.js
│   └── ...
├── middlewares/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   ├── asyncHandler.js
│   └── errorHandler.js
├── utils/
│   ├── jwt.js
│   ├── password.js
│   ├── cartFormatter.js
│   └── productFormatter.js
├── public/
├── supabase/
├── postman/
└── models/
```

---

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ recommended
- npm
- A Supabase project with Postgres tables configured
- A Stripe account for payment setup
- A JWT secret and environment configuration

---

## Environment Setup

Create a local environment file based on the example configuration:

```bash
cp .env.example .env.local
```

Then update the values in `.env.local`.

### Required environment variables

| Variable                 | Description                               |
| ------------------------ | ----------------------------------------- |
| PORT                     | Server port, usually 8000                 |
| SUPABASE_URL             | Supabase project URL                      |
| SUPABASE_PUBLISHABLE_KEY | Supabase public key                       |
| SUPABASE_SECRET_KEY      | Supabase secret key                       |
| SUPABASE_JWKS_URL        | Supabase JWKS URL                         |
| JWT_ACCESS_SECRET        | Secret used to sign access tokens         |
| JWT_REFRESH_SECRET       | Secret used to sign refresh tokens        |
| ACCESS_TOKEN_EXPIRY      | Access token lifetime, e.g. 1d            |
| REFRESH_TOKEN_EXPIRY     | Refresh token lifetime, e.g. 7d           |
| BCRYPT_SALT_ROUNDS       | Password hashing cost                     |
| PAYMENT_PROVIDER         | Payment provider, usually stripe          |
| STRIPE_SECRET_KEY        | Stripe secret key                         |
| STRIPE_WEBHOOK_SECRET    | Stripe webhook signing secret             |
| XPAY_API_KEY             | Optional alternative payment provider key |
| XPAY_WEBHOOK_SECRET      | Optional payment webhook secret           |
| FRONTEND_URL             | Frontend origin for CORS                  |

Example:

```env
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_SALT_ROUNDS=10
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:5173
```

---

## Installation

Install the project dependencies:

```bash
npm install
```

---

## Running the App

Run in development mode:

```bash
npm run dev
```

Run the production server:

```bash
npm start
```

The server usually runs on:

```text
http://localhost:8000
```

---

## API Base URL

```text
http://localhost:8000/api
```

---

## Authentication

Protected routes require a bearer token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

### Standard response format

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

### Error response format

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

### Common HTTP status codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

---

## Health Check

```bash
curl http://localhost:8000/api/health
```

Response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

## Auth Routes

### Register user

```http
POST /api/auth/register
```

Request body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "923001234567",
  "password": "StrongPass@123"
}
```

### Login user

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

### Current user

```http
GET /api/auth/me
```

---

## User Routes

### Get profile

```http
GET /api/users/profile
```

### Update profile

```http
PATCH /api/users/profile
```

### Change password

```http
PUT /api/users/change-password
```

---

## Address Routes

Authenticated routes:

```http
GET /api/addresses
GET /api/addresses/:id
POST /api/addresses
PATCH /api/addresses/:id
DELETE /api/addresses/:id
PATCH /api/addresses/:id/default
```

Example create request:

```json
{
  "label": "Home",
  "recipient_name": "John Doe",
  "phone": "923001234567",
  "address_line_1": "House 12, Street 5",
  "address_line_2": "Gulberg",
  "city": "Lahore",
  "province": "Punjab",
  "postal_code": "54000",
  "country_code": "PK",
  "delivery_notes": "Leave at gate"
}
```

---

## Wishlist Routes

```http
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:productId
```

Example:

```json
{
  "product_id": 12
}
```

---

## Cart Routes

Authenticated routes:

```http
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:variantId
DELETE /api/cart/items/:variantId
DELETE /api/cart
```

Add item example:

```json
{
  "product_variant_id": 5,
  "quantity": 2
}
```

Update quantity example:

```json
{
  "quantity": 3
}
```

---

## Catalog Routes

### Categories

```http
GET /api/categories
GET /api/categories/:id
POST /api/categories
PATCH /api/categories/:id
DELETE /api/categories/:id
```

### Brands

```http
GET /api/brands
GET /api/brands/:id
POST /api/brands
PATCH /api/brands/:id
DELETE /api/brands/:id
```

### Products

```http
GET /api/products
GET /api/products/:id
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id
```

### Product query parameters

```http
GET /api/products?search=iphone&category=1&featured=true&sort=price&order=asc
```

Supported query params include:

- page
- limit
- search
- category
- brand
- featured
- active
- sort
- order

---

## Order Routes

Authenticated routes:

```http
POST /api/orders
GET /api/orders
GET /api/orders/:id
POST /api/orders/:id/cancel
```

Create order example:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "coupon_code": "SAVE10"
}
```

Orders are built from the user cart, validated against current inventory, and stored with snapshot data for order items.

---

## Payment Routes

```http
POST /api/payments/orders/:orderId
```

This endpoint initializes payment for an existing order. Stripe integration is wired for production-style checkout flow.

Webhook endpoint:

```http
POST /api/payments/webhook
```

> Webhook routes are typically configured in the payment provider dashboard and should be kept secure.

---

## Review Routes

```http
GET /api/reviews/products/:productId
POST /api/reviews/products/:productId
PUT /api/reviews/:id
DELETE /api/reviews/:id
```

This module allows customers to write product reviews and manage their own reviews.

---

## Admin Routes

The project includes dedicated admin APIs for internal management.

### Admin dashboard

```http
GET /api/admin/dashboard
```

### Admin inventory

```http
GET /api/admin/inventory
GET /api/admin/inventory/:id
PATCH /api/admin/inventory/:id
GET /api/admin/inventory/:id/movements
```

### Admin reviews

```http
GET /api/admin/reviews
PATCH /api/admin/reviews/:id/flag
PATCH /api/admin/reviews/:id/remove
PATCH /api/admin/reviews/:id/restore
```

### Admin orders

```http
GET /api/orders/admin/all
GET /api/orders/admin/:id
PATCH /api/orders/admin/:id/status
```

### Admin reports and analytics

```http
GET /api/admin/analytics
GET /api/admin/reports/sales
GET /api/admin/reports/orders
GET /api/admin/reports/products
GET /api/admin/reports/inventory
GET /api/admin/reports/coupons
```

### Admin coupons

```http
GET /api/admin/coupons
POST /api/admin/coupons
PATCH /api/admin/coupons/:id
DELETE /api/admin/coupons/:id
```

---

## Database Notes

This project uses Supabase as its persistence layer. The API depends on database tables such as:

- users
- addresses
- products
- categories
- brands
- product_variants
- carts
- cart_items
- orders
- order_items
- reviews
- coupons
- payments
- refunds

The Supabase client is configured in `config/supabase.js` and the server uses environment variables to connect to the project securely.

---

## Security Notes

This backend includes several safety measures:

- JWT-based protected routes
- Input validation via Zod
- Helmet for HTTP header hardening
- CORS configuration
- Rate limiting for high-risk endpoints
- Centralized error handling
- Service-layer validation for inventory, carts, orders, and payments

---

## Development Notes

- Use `npm run dev` for live-reload development.
- Keep `.env.local` out of source control if it contains secrets.
- Validate carts and inventory before finalizing orders.
- Keep webhook endpoints private and verify signatures from Stripe.
- Use the supplied Supabase migration and seed structure for database setup.

---

## Production Considerations

Before deploying this API to production, make sure to:

- set secure JWT secrets
- configure real Stripe keys and webhook secret
- enable secure CORS origins
- validate environment variables in all deployment environments
- set up monitoring, logging, and backup policies
- test checkout, payment, and admin flows end-to-end

---

## Conclusion

This repository is a complete Node.js e-commerce backend with customer-facing APIs and admin functionality built around a Supabase database. It is ready for integration with a frontend storefront or mobile app and provides the core foundation for a retail commerce platform.
