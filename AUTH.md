# Authentication Guide

This project uses JWT-based authentication for protected endpoints. User registration, login, token verification, and route access are handled through the auth middleware and JWT utility helpers.

---

## 1. Authentication Flow

The typical flow is:

1. User registers or logs in.
2. Server validates credentials.
3. Server issues access and refresh tokens.
4. Frontend stores the token and sends it in the Authorization header.
5. Protected routes verify the token in the middleware.

---

## 2. Token Types

### Access Token

Used for everyday auth on protected API routes.

- Signed using JWT_ACCESS_SECRET
- Sent in the Authorization header
- Usually short-lived, such as 1 day

### Refresh Token

Used to obtain a new access token when the access token expires.

- Signed using JWT_REFRESH_SECRET
- Usually longer-lived, such as 7 days

---

## 3. JWT Configuration

The JWT helpers are defined in:

- utils/jwt.js

The key functions are:

- generateAccessToken(payload)
- generateRefreshToken(payload)
- verifyAccessToken(token)
- verifyRefreshToken(token)

These use the environment variables:

- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- ACCESS_TOKEN_EXPIRY
- REFRESH_TOKEN_EXPIRY

---

## 4. Login and Register Endpoints

### POST /api/auth/register

Creates a new user account.

Example request:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "923001234567",
  "password": "StrongPass@123"
}
```

Example response:

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "...",
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login

Validates the email and password and returns JWT tokens.

Example request:

```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

Example response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": "...",
      "email": "john@example.com"
    }
  }
}
```

---

## 5. Protected Route Middleware

The auth middleware is in:

- middlewares/authenticate.js

It checks for the Authorization header and expects the format:

```http
Authorization: Bearer <token>
```

Behavior:

- If the header is missing -> 401 Unauthorized
- If the token format is invalid -> 401 Unauthorized
- If the token is expired or invalid -> 401 Unauthorized
- If valid, it attaches req.user with:
  - id
  - role

Example:

```js
req.user = {
  id: decoded.id,
  role: decoded.role,
};
```

---

## 6. Role-Based Authorization

The role-based middleware is in:

- middlewares/authorize.js

This is used for admin-only routes.

Example:

```js
router.get("/admin", authenticate, authorize("admin"), controller.getDashboard);
```

If a user is not an admin, the request is rejected.

---

## 7. Authenticated User Routes

These endpoints require a valid token:

```http
GET /api/auth/me
GET /api/users/profile
PATCH /api/users/profile
PUT /api/users/change-password
GET /api/addresses
POST /api/addresses
GET /api/cart
POST /api/cart/items
POST /api/orders
GET /api/orders
```

---

## 8. Password Handling

Password hashing logic is managed in:

- utils/password.js

This project uses bcrypt for secure password storage.

Typical flow:

1. Hash password at registration.
2. Compare password with bcrypt during login.
3. Never store plain-text passwords in the database.

---

## 9. Security Notes

This auth system includes the following protections:

- JWT signing with environment secrets
- access tokens and refresh tokens separated by purpose
- bearer token validation on protected routes
- role-based admin checks
- validation middleware before auth logic
- centralized error handling for unauthorized requests

---

## 10. Example Client Usage

### Using curl

```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Using JavaScript fetch

```js
const token = localStorage.getItem("access_token");

const response = await fetch("http://localhost:8000/api/users/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

---

## 11. Error Responses

Typical authentication errors:

### Missing token

```json
{
  "success": false,
  "message": "Authentication required."
}
```

### Invalid token format

```json
{
  "success": false,
  "message": "Invalid authorization format."
}
```

### Expired or invalid token

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

---

## 12. Best Practices

- Store access tokens in secure client storage or in-memory state.
- Refresh token should be kept secure and rotated if your app supports it.
- Do not expose JWT secrets in the frontend.
- Always validate role and permissions before admin actions.
- Handle 401 responses by logging the user out or refreshing the token.

---

## 13. Summary

The project uses a standard JWT authentication model with:

- secure password hashing
- token signing and verification
- bearer-token route protection
- role-based access control
- clean separation between auth logic and service logic

This makes it suitable for a storefront and admin dashboard backend with secure user sessions.
