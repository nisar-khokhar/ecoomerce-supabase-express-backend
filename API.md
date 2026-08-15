# API Reference

This document lists the main backend endpoints for the Node Express e-commerce API.

Base URL:

```text
http://localhost:8000/api
```

Authentication:

```http
Authorization: Bearer <access_token>
```

Common response format:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Error format:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

## 1. Health

### GET /health

Checks if the API is running.

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

## 2. Authentication

### POST /auth/register

Register a new customer account.

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

### POST /auth/login

Login and receive JWT tokens.

Request body:

```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

Example success response:

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

### GET /auth/me

Get logged-in user details.

Headers:

```http
Authorization: Bearer <token>
```

---

## 3. Users

### GET /users/profile

Authenticated user profile.

### PATCH /users/profile

Update user profile.

Example body:

```json
{
  "first_name": "Jane",
  "last_name": "Doe"
}
```

### PUT /users/change-password

Change password.

Example body:

```json
{
  "current_password": "OldPass@123",
  "new_password": "NewPass@123"
}
```

---

## 4. Addresses

Authenticated routes:

```http
GET /addresses
GET /addresses/:id
POST /addresses
PATCH /addresses/:id
DELETE /addresses/:id
PATCH /addresses/:id/default
```

### POST /addresses

Example body:

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

## 5. Catalog

### Categories

```http
GET /categories
GET /categories/:id
POST /categories
PATCH /categories/:id
DELETE /categories/:id
```

### Brands

```http
GET /brands
GET /brands/:id
POST /brands
PATCH /brands/:id
DELETE /brands/:id
```

### Products

```http
GET /products
GET /products/:id
POST /products
PATCH /products/:id
DELETE /products/:id
```

### Product search and filter params

```http
GET /products?search=iphone&category=1&brand=2&featured=true&active=true&sort=price&order=asc&page=1&limit=10
```

Supported params:

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

## 6. Product Variants

```http
GET /product-variants
```

Used to fetch variant-level product data and inventory metadata.

---

## 7. Variant Types & Variant Values

```http
GET /variant-types
GET /variant-values
```

---

## 8. Wishlist

Authenticated routes:

```http
GET /wishlist
POST /wishlist
DELETE /wishlist/:productId
```

### POST /wishlist

```json
{
  "product_id": 12
}
```

---

## 9. Cart

Authenticated routes:

```http
GET /cart
POST /cart/items
PATCH /cart/items/:variantId
DELETE /cart/items/:variantId
DELETE /cart
```

### POST /cart/items

```json
{
  "product_variant_id": 5,
  "quantity": 2
}
```

### PATCH /cart/items/:variantId

```json
{
  "quantity": 3
}
```

---

## 10. Orders

Authenticated routes:

```http
POST /orders
GET /orders
GET /orders/:id
POST /orders/:id/cancel
```

### POST /orders

Create an order from the current cart.

Request body:

```json
{
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "coupon_code": "SAVE10"
}
```

### GET /orders

Query params:

- page
- limit
- status
- payment_status

Example:

```http
GET /orders?page=1&limit=10&status=pending
```

---

## 11. Payments

Authenticated routes:

```http
POST /payments/orders/:orderId
```

This initializes payment for an existing order.

Webhook route:

```http
POST /payments/webhook
```

---

## 12. Reviews

Public route:

```http
GET /reviews/products/:productId
```

Authenticated routes:

```http
POST /reviews/products/:productId
PUT /reviews/:id
DELETE /reviews/:id
```

### POST /reviews/products/:productId

```json
{
  "rating": 5,
  "title": "Great product",
  "comment": "Very satisfied with quality and delivery."
}
```

---

## 13. Admin Routes

All admin routes require authentication and admin role authorization.

### Dashboard

```http
GET /admin/dashboard
```

### Inventory

```http
GET /admin/inventory
GET /admin/inventory/:id
PATCH /admin/inventory/:id
GET /admin/inventory/:id/movements
```

### Reviews moderation

```http
GET /admin/reviews
PATCH /admin/reviews/:id/flag
PATCH /admin/reviews/:id/remove
PATCH /admin/reviews/:id/restore
```

### Orders administration

```http
GET /orders/admin/all
GET /orders/admin/:id
PATCH /orders/admin/:id/status
```

### Reports and analytics

```http
GET /admin/analytics
GET /admin/reports/sales
GET /admin/reports/orders
GET /admin/reports/products
GET /admin/reports/inventory
GET /admin/reports/coupons
```

### Coupons

```http
GET /admin/coupons
POST /admin/coupons
PATCH /admin/coupons/:id
DELETE /admin/coupons/:id
```

---

## 14. Status Codes

| Code | Meaning                   |
| ---- | ------------------------- |
| 200  | Success                   |
| 201  | Created                   |
| 400  | Validation or bad request |
| 401  | Unauthorized              |
| 404  | Resource not found        |
| 500  | Server error              |

---

## 15. Notes for Frontend Integration

- Always send the token in the Authorization header for protected endpoints.
- Use JSON bodies with Content-Type: application/json.
- Product catalog and cart endpoints are designed to work with storefront UI flows.
- Cart items are stored per user, and order creation creates order snapshots from the current cart.
- Payment and webhook endpoints should be handled carefully in production environments.

---

## Example cURL Requests

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "923001234567",
    "password": "StrongPass@123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "StrongPass@123"
  }'
```

### Get cart

```bash
curl http://localhost:8000/api/cart \
  -H "Authorization: Bearer <token>"
```

### Create order

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address_id": 1,
    "billing_address_id": 1
  }'
```
