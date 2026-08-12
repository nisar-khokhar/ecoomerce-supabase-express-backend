# Node Express E-commerce API

This backend provides a modular REST API for an e-commerce storefront and admin-ready workflow. It is currently built with Node.js, Express, and Supabase, and it supports product catalog management plus authenticated customer features such as profile, addresses, wishlist, cart, orders, and payments.

## 🚀 Project Overview

The API is organized around reusable modules:

- Express routes for each feature area
- Controllers for request handling
- Services for business logic
- Validators using Zod for request validation
- Supabase for data persistence
- JWT-based authentication for protected routes

## ✅ Current Implemented APIs

The following modules are already available for frontend integration:

- Catalog: products, categories, brands, product variants, variant types, variant values
- Authentication and user profile
- Address management
- Wishlist
- Cart
- Orders and checkout
- Payments

## 🔧 Base URL

For local development:

- Base URL: http://localhost:8000
- API prefix: /api

Example:

- http://localhost:8000/api/products
- http://localhost:8000/api/auth/login

## 🔐 Authentication

Protected endpoints require a Bearer token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

Expected response shape for successful requests:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Expected response shape for errors:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

## 📦 Common Status Codes

- 200 OK: successful read/update
- 201 Created: successful create
- 400 Bad Request: invalid payload or validation failure
- 401 Unauthorized: missing or invalid token
- 404 Not Found: resource not found
- 500 Internal Server Error: unexpected server issue

---

## 1) Health Check

### GET /api/health

Checks whether the API is running.

Example:

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

## 2) Authentication

### POST /api/auth/register

Create a new customer account.

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

Response:

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login

Log in a user and receive a JWT-based session token.

Request body:

```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": 1,
      "email": "john@example.com"
    }
  }
}
```

### GET /api/auth/me

Get the currently logged-in user's basic profile information.

Headers:

```http
Authorization: Bearer <access_token>
```

---

## 3) User Profile

### GET /api/users/profile

Get the logged-in user's profile.

### PATCH /api/users/profile

Update profile details.

Request body example:

```json
{
  "first_name": "Jane"
}
```

### PUT /api/users/change-password

Change the authenticated user's password.

Request body:

```json
{
  "current_password": "OldPass@123",
  "new_password": "NewPass@123"
}
```

---

## 4) Addresses

All address routes require authentication.

### GET /api/addresses

Get all addresses for the logged-in user.

### GET /api/addresses/:id

Get one address by ID.

### POST /api/addresses

Create a new address.

Request body:

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

### PATCH /api/addresses/:id

Update an address.

### DELETE /api/addresses/:id

Delete an address.

### PATCH /api/addresses/:id/default

Set an address as the default delivery address.

---

## 5) Wishlist

All wishlist routes require authentication.

### GET /api/wishlist

Returns the current user's wishlist.

### POST /api/wishlist

Add a product to the wishlist.

Request body:

```json
{
  "product_id": 12
}
```

### DELETE /api/wishlist/:productId

Remove a product from the wishlist.

---

## 6) Cart

All cart routes require authentication.

### GET /api/cart

Get the authenticated user's cart.

### POST /api/cart/items

Add a product variant to the cart.

Request body:

```json
{
  "product_variant_id": 5,
  "quantity": 2
}
```

### PATCH /api/cart/items/:variantId

Update cart item quantity.

Request body:

```json
{
  "quantity": 3
}
```

### DELETE /api/cart/items/:variantId

Remove one item from the cart.

### DELETE /api/cart

Clear the complete cart.

---

## 7) Orders

All order routes require authentication.

### POST /api/orders

Create an order from the current cart and selected addresses.

Request body:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1
}
```

### GET /api/orders

Get all orders for the logged-in user.

Optional query parameters:

- page
- limit
- status
- payment_status

Example:

```http
GET /api/orders?page=1&limit=10&status=pending
```

### GET /api/orders/:id

Get one order by ID.

---

## 8) Payments

All payment routes require authentication.

### POST /api/payments/orders/:orderId

Initialize a payment session for an existing order.

Example:

```bash
curl -X POST http://localhost:8000/api/payments/orders/12 \
  -H "Authorization: Bearer <token>"
```

### POST /api/payments/webhook/stripe

Stripe webhook endpoint for payment events.

> This endpoint is used by payment providers and should be configured in your payment dashboard.

---

## 9) Catalog APIs

### Categories

- GET /api/categories
- GET /api/categories/:id
- POST /api/categories
- PATCH /api/categories/:id
- DELETE /api/categories/:id

### Brands

- GET /api/brands
- GET /api/brands/:id
- POST /api/brands
- PATCH /api/brands/:id
- DELETE /api/brands/:id

### Products

- GET /api/products
- GET /api/products/:id
- POST /api/products
- PATCH /api/products/:id
- DELETE /api/products/:id

### Product query parameters

For GET /api/products:

- page
- limit
- search
- category
- brand
- featured
- active
- sort (price, name, created_at)
- order (asc, desc)

Example:

```http
GET /api/products?search=iphone&category=1&featured=true&sort=price&order=asc
```

---

## 10) Frontend Integration Notes

- Store the access token securely in memory or a secure storage mechanism.
- Always attach the token to protected routes.
- Use the product detail and variant endpoints to build product cards and checkout flows.
- Cart, wishlist, and addresses should be loaded after authentication is complete.
- For create/update operations, send JSON content with the correct Content-Type header.

Example header:

```http
Content-Type: application/json
```

---

## 11) Upcoming APIs

The following modules are planned for future implementation:

- Reviews
- Discounts
- Coupons
- Admin dashboard analytics and management endpoints
- Advanced order management
- Product image upload support

---

## 🧪 Run the Project

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Or start the server normally:

```bash
npm start
```

## ⚙️ Environment Setup

Create a local environment file using the provided example file:

```bash
cp .env.example .env.local
```

Required variables include:

- PORT
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY
- SUPABASE_JWKS_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- PAYMENT_PROVIDER
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

---

This README is intended as a frontend handoff reference for the current backend implementation.
