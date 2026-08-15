# Security Documentation

This document outlines the security measures, best practices, and configurations implemented in this project to protect user data, prevent unauthorized access, and maintain system integrity.

---

## 1. Overview

This project implements multiple layers of security to protect:

- user authentication and authorization
- sensitive data in transit and at rest
- API endpoints from common attacks
- database integrity and access control
- payment and transaction security

---

## 2. Authentication

### JWT (JSON Web Tokens)

The project uses JWT for stateless authentication. Users receive a token upon login and must include it in subsequent requests.

**Implementation:**

- located in: `utils/jwt.js`
- tokens contain user ID and role
- tokens expire after a configured duration
- refresh tokens can be used to obtain new access tokens (if implemented)

**Token Structure:**

```javascript
{
  userId: "user-uuid",
  email: "user@example.com",
  role: "customer", // or "admin"
  iat: 1692000000,
  exp: 1692003600
}
```

**Environment Variables:**

```env
JWT_SECRET=your-super-secret-key-with-high-entropy
JWT_EXPIRY=3600  # 1 hour in seconds
JWT_REFRESH_EXPIRY=604800  # 7 days in seconds
```

### Password Security

Passwords are hashed using a secure hashing algorithm (typically bcrypt).

**Implementation:**

- located in: `utils/password.js`
- never store plaintext passwords
- use bcrypt with salt rounds >= 10
- implement password strength validation

**Example:**

```javascript
const hashedPassword = await hashPassword(userPassword);
const isValid = await verifyPassword(inputPassword, hashedPassword);
```

### Login Endpoint

```http
POST /api/auth/login
```

Input:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:

```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

## 3. Authorization

### Middleware-Based Access Control

The project uses role-based access control (RBAC) and middleware to protect endpoints.

**Middleware Layers:**

- `authenticate`: verifies JWT token validity
- `authorize`: checks user role against endpoint requirements
- `validate`: validates request data using Zod schemas

**Implementation:**

- located in: `middlewares/authenticate.js`
- located in: `middlewares/authorize.js`
- located in: `middlewares/validate.js`

**Example Route Protection:**

```javascript
router.post(
  "/admin-dashboard",
  authenticate,
  authorize("admin"),
  controller.getDashboard,
);
```

Only authenticated admin users can access this endpoint.

### Role Types

- **customer**: regular user, can browse products, create orders, submit reviews
- **admin**: can manage inventory, view analytics, process refunds, moderate reviews
- **guest**: unauthenticated users can browse public endpoints (product listings, categories)

---

## 4. Middleware Security

### Helmet.js

Helmet sets secure HTTP headers to protect against common vulnerabilities.

**Headers included:**

- Content-Security-Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME type sniffing)
- Strict-Transport-Security (HTTPS enforcement)
- X-XSS-Protection (XSS filter)

**Configuration in app.js:**

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### CORS (Cross-Origin Resource Sharing)

CORS is configured to allow requests only from trusted origins.

**Configuration:**

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  }),
);
```

**Environment Variable:**

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Rate Limiting

Rate limiting prevents brute force and DoS attacks.

**Configuration:**

```javascript
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
```

More restrictive limits can be applied to sensitive endpoints (login, payment).

---

## 5. Input Validation

### Zod Schemas

All request inputs are validated using Zod before processing.

**Implementation:**

- located in: `validators/` directory
- applied via `validate` middleware
- provides type-safe request body, params, and query validation

**Example Validator:**

```javascript
// validators/auth.validator.js
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/login", validate(loginSchema), controller.login);
```

**Benefits:**

- prevents invalid data from reaching business logic
- sanitizes input to prevent injection attacks
- consistent error messages
- type safety across the stack

---

## 6. SQL Injection Prevention

The project uses Supabase with parameterized queries, which prevents SQL injection.

**Safe Example:**

```javascript
const { data, error } = await supabase.from("users").select().eq("id", userId); // parameterized, safe
```

**Never do this:**

```javascript
// DO NOT USE - vulnerable to SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

Supabase's query builder and ORM prevent raw SQL concatenation.

---

## 7. XSS (Cross-Site Scripting) Protection

### Content-Security-Policy

Helmet's CSP header mitigates XSS by restricting script sources.

### Sanitization

User-generated content (reviews, comments) should be:

- stripped of HTML tags
- escaped before rendering
- validated with length limits

**Example:**

```javascript
const sanitizeHtml = require("sanitize-html");
const cleanedReview = sanitizeHtml(userReview, {
  allowedTags: [], // no HTML tags allowed
  allowedAttributes: {},
});
```

---

## 8. Environment Variables and Secrets

Sensitive data must never be hardcoded. Use environment variables:

```env
# Authentication
JWT_SECRET=very-long-random-secret-key
JWT_EXPIRY=3600

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anonymous-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
NODE_ENV=production

# Email (if implemented)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=secure-password
```

**Best Practices:**

- never commit .env to version control
- use .env.example with dummy values for reference
- rotate secrets regularly
- use a secrets manager in production (AWS Secrets Manager, HashiCorp Vault, etc.)
- different secrets for dev, staging, and production

---

## 9. Payment Security

### Stripe Integration

- never expose Stripe secret keys to the frontend
- webhook signatures must be verified before processing
- payment intents are created server-side, not client-side
- PCI compliance is maintained by using Stripe's hosted solutions

**Webhook Verification:**

```javascript
// routes/paymentWebhook.routes.js
const sig = req.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
```

### Refund Security

- only admins can initiate refunds
- refund amounts must not exceed original payment
- refund audit trail is maintained in the database

---

## 10. Error Handling

### Error Middleware

Errors are caught and logged without exposing sensitive information to users.

**Implementation:**

- located in: `middlewares/errorHandler.js`
- catches unhandled promise rejections
- logs errors to a file or monitoring service (recommended)
- returns generic error messages to clients

**Example:**

```javascript
// Client sees:
{ error: 'Internal server error' }

// Backend logs:
{
  timestamp: '2026-08-15T10:00:00Z',
  error: 'Database connection failed',
  stack: '...',
  userId: 'user-123'
}
```

### Async Handler

The `asyncHandler` middleware wraps async route handlers to catch errors:

```javascript
// middlewares/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  "/orders",
  asyncHandler(async (req, res) => {
    // no need to wrap in try-catch
  }),
);
```

---

## 11. Database Security

### Row-Level Security (RLS)

Supabase supports RLS policies to enforce data access at the database level.

**Example:**

```sql
-- only users can see their own data
CREATE POLICY "users_can_see_own_data"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

### Service Role Key

Use the service role key only for server-side operations, never expose to clients.

```javascript
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
```

---

## 12. HTTPS and Transport Security

### Strict-Transport-Security (HSTS)

Helmet sets HSTS header to enforce HTTPS:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### In Production

- use valid SSL/TLS certificates (from Let's Encrypt or your CA)
- redirect HTTP to HTTPS
- set secure cookie flag (httpOnly, Secure, SameSite)

---

## 13. Session and Cookie Security

If using sessions (not recommended; JWT is preferred):

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    httpOnly: true, // prevent JavaScript access
    secure: true, // HTTPS only
    sameSite: "strict", // CSRF protection
    maxAge: 1000 * 60 * 60, // 1 hour
  }),
);
```

---

## 14. Logging and Monitoring

### Audit Logs

Log sensitive actions:

- login/logout
- password changes
- inventory adjustments
- refunds and payments
- admin actions

**Example:**

```javascript
await supabase.from("audit_logs").insert({
  user_id: userId,
  action: "refund_initiated",
  resource_id: orderId,
  timestamp: new Date().toISOString(),
});
```

### Monitoring Tools

Recommended:

- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for infrastructure monitoring
- **Prometheus** for metrics collection

---

## 15. Third-Party Dependencies

### Dependency Scanning

Use tools to check for vulnerabilities:

```bash
npm audit
npm audit fix
```

### Regular Updates

- update dependencies monthly or quarterly
- use `npm outdated` to check for updates
- test thoroughly after major version updates

---

## 16. Common Attack Vectors and Mitigations

| Attack                       | Mitigation                                  |
| ---------------------------- | ------------------------------------------- |
| **SQL Injection**            | Parameterized queries, ORM                  |
| **XSS**                      | Input sanitization, CSP headers             |
| **CSRF**                     | SameSite cookies, CSRF tokens               |
| **Brute Force**              | Rate limiting, account lockout              |
| **DDoS**                     | Rate limiting, WAF, CDN                     |
| **Man-in-the-Middle**        | HTTPS, HSTS header                          |
| **Weak Passwords**           | Password validation, hashing                |
| **Exposed Secrets**          | Environment variables, secrets manager      |
| **Insecure Deserialization** | Input validation, avoid dangerous functions |
| **Privilege Escalation**     | Authorization checks, RBAC                  |

---

## 17. Security Checklist for Deployment

- [ ] All secrets are in .env, not in code
- [ ] HTTPS is enabled and valid certificate is installed
- [ ] CORS is configured to trusted origins only
- [ ] Rate limiting is active on all endpoints
- [ ] JWT_SECRET is at least 32 characters and random
- [ ] Helmet middleware is enabled
- [ ] Input validation with Zod is active
- [ ] Database RLS policies are configured
- [ ] Audit logging is enabled
- [ ] Error messages do not expose internal details
- [ ] Dependency vulnerabilities are fixed (npm audit)
- [ ] Monitoring and alerting are configured
- [ ] Admin panel requires strong authentication
- [ ] Payment webhook signatures are verified
- [ ] Backup and disaster recovery plan is in place

---

## 18. Security Response Procedure

If a security vulnerability is discovered:

1. **Immediately notify** the development team
2. **Document** the vulnerability details and impact
3. **Develop a fix** and test it thoroughly
4. **Deploy** the fix to production
5. **Audit logs** to check if the vulnerability was exploited
6. **Notify affected users** if data was compromised
7. **Post-mortem** to prevent similar issues

---

## 19. Key Files

- middlewares/authenticate.js
- middlewares/authorize.js
- middlewares/validate.js
- middlewares/errorHandler.js
- middlewares/asyncHandler.js
- utils/jwt.js
- utils/password.js
- validators/
- config/supabase.js
- app.js

---

## 20. Summary

Security is multi-layered in this project:

- **Authentication** via JWT tokens
- **Authorization** through role-based middleware
- **Input validation** with Zod schemas
- **Transport security** via HTTPS and CSP headers
- **Data protection** through parameterized queries and sanitization
- **Error handling** without exposing sensitive details
- **Monitoring and auditing** for compliance and incident response

This comprehensive approach makes the project suitable for production use with sensitive user data and payment processing. Regular security audits, dependency updates, and adherence to the deployment checklist are essential for maintaining a secure system.
