# Architecture Guide

This project follows a modular backend architecture for a production-style e-commerce API. The design keeps routing, validation, business logic, database access, and error handling separated so the codebase remains scalable and maintainable.

---

## 1. Architectural Pattern

The application uses a layered service-oriented structure:

- Routes layer: defines HTTP endpoints
- Controllers layer: handles request/response flow
- Validators layer: validates incoming data using Zod
- Services layer: contains the business logic and database calls
- Config layer: centralizes environment and Supabase configuration
- Middlewares: authentication, authorization, validation, and error handling
- Utilities: shared helpers such as JWT and password utilities

This pattern keeps business rules out of controller code and makes it easier to extend functionality without breaking other modules.

---

## 2. High-Level Flow

A typical request follows this path:

```text
HTTP Request
  -> Express route
  -> Validation middleware
  -> Controller
  -> Service
  -> Supabase/Postgres query
  -> Response
```

Example:

```text
POST /api/orders
  -> routes/order.routes.js
  -> validators/order.validator.js
  -> controllers/order.controller.js
  -> services/order.service.js
  -> Supabase orders table + cart validation + order_items insert
  -> JSON response
```

---

## 3. Folder Responsibilities

### app.js

Entry point for the Express application.

Responsibilities:

- loads environment variables
- configures CORS, Helmet, body parsing, cookie parsing
- mounts route modules
- registers global error handler
- starts the HTTP server via bin/www

---

### routes/

Contains endpoints grouped by feature.

Examples:

- auth.routes.js
- product.routes.js
- cart.routes.js
- order.routes.js
- payment.routes.js
- admin-inventory.routes.js

Each file registers related endpoints and attaches validation and middleware where needed.

---

### controllers/

Handles HTTP requests and delegated work.

Examples:

- auth.controller.js
- cart.controller.js
- order.controller.js
- payment.controller.js
- product.controller.js

The controllers typically:

- receive req and res
- call service methods
- format JSON responses
- return success/error payloads consistently

---

### services/

Contains the main business logic.

Examples:

- auth.service.js
- cart.service.js
- order.service.js
- payment.service.js
- product.service.js
- coupon.service.js

This is where most complex rules live, such as:

- checking cart validity
- validating inventory
- applying coupons
- creating orders
- payment initialization
- refund logic

---

### validators/

Defines API request validation with Zod.

Examples:

- auth.validator.js
- cart.validator.js
- order.validator.js
- product.validator.js
- review.validator.js

These ensure:

- required fields exist
- IDs are valid
- numeric ranges and enums are respected
- invalid payloads fail early before reaching the service layer

---

### middlewares/

Handles cross-cutting concerns.

Examples:

- authenticate.js -> validates JWT and loads req.user
- authorize.js -> blocks non-admin access
- validate.js -> executes Zod schema validation
- asyncHandler.js -> catches async errors
- errorHandler.js -> formats and returns error responses

---

### config/

Contains environment configuration.

- supabase.js creates the Supabase client from environment variables.

This centralizes database wiring so the rest of the app doesn't directly manage connection details.

---

### utils/

Shared helper functions.

Examples:

- jwt.js
- password.js
- cartFormatter.js
- productFormatter.js

These utilities reduce duplication across services and controllers.

---

## 4. Request Lifecycle Example

For a customer creating an order:

1. Client sends POST /api/orders with token and payload.
2. Router matches order route and applies authenticate middleware.
3. Validator ensures shipping_address_id and optional fields are valid.
4. Controller calls orderService.createOrder(userId, body).
5. Service loads the user cart and validates all items.
6. It checks product variants and inventory availability.
7. It applies coupon logic if provided.
8. It inserts a new order row into orders.
9. It inserts order_items snapshots.
10. It returns the full created order.
11. Controller responds with success JSON.

---

## 5. Authentication and Authorization Architecture

### Authentication

Handled by middlewares/authenticate.js.

Responsibilities:

- reads Authorization: Bearer token
- verifies JWT
- loads user details into req.user
- rejects missing or invalid tokens with 401

### Authorization

Handled by middlewares/authorize.js.

Responsibilities:

- checks user.role
- allows only admin routes to pass through
- blocks unauthorized users early

This allows the app to separate:

- who is logged in
- what that user is allowed to do

---

## 6. Database Access Architecture

Data access is centralized through Supabase client usage in services.

Pattern:

```js
const supabase = require("../config/supabase");
```

This is used across service files like:

- auth.service.js
- product.service.js
- cart.service.js
- order.service.js
- payment.service.js
- review.service.js

This approach keeps database logic out of the route layer and makes queries easier to test and maintain.

---

## 7. Error Handling Architecture

The app uses centralized error handling in:

- middlewares/errorHandler.js

This ensures all exceptions and validation failures are shaped into consistent JSON responses.

Typical pattern:

- async routes are wrapped with asyncHandler
- errors are passed to next(error)
- error middleware converts them into API responses

This prevents repetitive try/catch blocks in each controller.

---

## 8. Security Architecture

The app includes security middleware and configuration such as:

- Helmet for header hardening
- CORS configuration
- body parser limits
- JWT-based route protection
- validation to reduce malformed inputs
- admin-only role checks for sensitive routes

This combination provides a solid baseline for an API backend.

---

## 9. Module Boundaries

The project is intentionally separated by concern:

| Layer       | Responsibility                           |
| ----------- | ---------------------------------------- |
| routes      | endpoint definitions                     |
| controllers | request orchestration                    |
| validators  | schema validation                        |
| services    | business logic                           |
| utils       | reusable helpers                         |
| config      | environment/database config              |
| middlewares | auth, access, validation, error handling |

This helps avoid tight coupling and makes the project easier to grow.

---

## 10. E-Commerce Domain Organization

The application organizes features by domain modules rather than by technical type only.

Examples:

- auth
- user
- address
- wishlist
- cart
- product
- category
- brand
- order
- payment
- review
- coupon
- admin inventory
- admin dashboard
- reports

This domain-driven structure makes the codebase feel closer to real business capabilities.

---

## 11. Why This Architecture Works Well

This architecture is effective because it allows the project to scale across multiple business areas:

- new features can be added as new route + controller + service modules
- validation stays consistent across endpoints
- database logic is isolated and reusable
- role checks protect admin workflows separately
- error handling remains centralized and predictable

---

## 12. Suggested Future Improvements

Possible future architecture enhancements:

- add repository layer for database access abstraction
- add service-level unit tests
- separate admin and customer modules more strictly
- move webhook handling into provider-specific adapters
- add pagination/query builder utilities for complex filters
- add structured logging and request tracing

---

## 13. Summary

This backend architecture is a clean Express + Supabase service-oriented layout designed for a commerce application. The codebase separates concerns clearly across routes, controllers, validation, services, and middleware, while keeping the database access and authorization flow easy to maintain and extend.
