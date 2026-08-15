# Testing Documentation

This document outlines the testing strategy, frameworks, and best practices for this Node.js Express e-commerce backend.

---

## 1. Overview

Testing is critical for maintaining code quality and reliability. This project should include:

- **Unit Tests**: Testing individual functions and modules
- **Integration Tests**: Testing interactions between modules and database
- **API Tests**: Testing HTTP endpoints and request/response flows
- **End-to-End Tests**: Testing complete workflows from start to finish

---

## 2. Testing Frameworks and Tools

### Primary Testing Framework: Jest

Jest is recommended for its ease of use and built-in mocking capabilities.

**Installation:**

```bash
npm install --save-dev jest @types/jest
```

**Configuration (jest.config.js):**

```javascript
module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "middlewares/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
```

### Additional Testing Tools

- **Supertest**: For testing HTTP endpoints

  ```bash
  npm install --save-dev supertest
  ```

- **nock**: For mocking HTTP requests to external APIs

  ```bash
  npm install --save-dev nock
  ```

- **@supabase/supabase-js**: Already installed, used in tests

---

## 3. Project Structure for Tests

Organize tests alongside source code:

```
project/
├── controllers/
│   ├── auth.controller.js
│   └── __tests__/
│       └── auth.controller.test.js
├── services/
│   ├── auth.service.js
│   └── __tests__/
│       └── auth.service.test.js
├── middlewares/
│   ├── authenticate.js
│   └── __tests__/
│       └── authenticate.test.js
├── utils/
│   ├── jwt.js
│   └── __tests__/
│       └── jwt.test.js
└── __tests__/
    ├── e2e/
    │   └── auth.flow.test.js
    └── integration/
        └── order.flow.test.js
```

---

## 4. Unit Testing

Unit tests validate individual functions without external dependencies.

### Example: JWT Utility Tests

**File: `utils/__tests__/jwt.test.js`**

```javascript
const jwt = require("../jwt");

describe("JWT Utils", () => {
  const secret = "test-secret-key";
  const payload = { userId: "123", role: "customer" };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = jwt.generateToken(payload, secret);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should include payload in token", () => {
      const token = jwt.generateToken(payload, secret);
      const decoded = jwt.verifyToken(token, secret);
      expect(decoded.userId).toBe("123");
      expect(decoded.role).toBe("customer");
    });

    it("should throw if secret is missing", () => {
      expect(() => {
        jwt.generateToken(payload, null);
      }).toThrow();
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = jwt.generateToken(payload, secret);
      const decoded = jwt.verifyToken(token, secret);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe("123");
    });

    it("should throw on invalid token", () => {
      expect(() => {
        jwt.verifyToken("invalid-token", secret);
      }).toThrow();
    });

    it("should throw on expired token", () => {
      const expiredToken = jwt.generateToken(payload, secret, "0s");
      expect(() => {
        jwt.verifyToken(expiredToken, secret);
      }).toThrow();
    });
  });
});
```

### Example: Password Utility Tests

**File: `utils/__tests__/password.test.js`**

```javascript
const password = require("../password");

describe("Password Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const plainPassword = "secure-password-123";
      const hashed = await password.hashPassword(plainPassword);
      expect(hashed).not.toBe(plainPassword);
      expect(hashed).toBeDefined();
    });

    it("should produce different hashes for same password", async () => {
      const plainPassword = "secure-password-123";
      const hash1 = await password.hashPassword(plainPassword);
      const hash2 = await password.hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const plainPassword = "secure-password-123";
      const hashed = await password.hashPassword(plainPassword);
      const isValid = await password.verifyPassword(plainPassword, hashed);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const plainPassword = "secure-password-123";
      const hashed = await password.hashPassword(plainPassword);
      const isValid = await password.verifyPassword("wrong-password", hashed);
      expect(isValid).toBe(false);
    });
  });
});
```

---

## 5. Integration Testing

Integration tests validate interactions between multiple modules.

### Example: Auth Service Integration Test

**File: `services/__tests__/auth.service.test.js`**

```javascript
const authService = require("../auth.service");
const supabase = require("../../config/supabase");

// Mock Supabase
jest.mock("../../config/supabase");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "user@example.com",
        password: "secure-pass-123",
        name: "Test User",
      };

      supabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: { id: "123", ...userData },
          error: null,
        }),
      });

      const result = await authService.registerUser(userData);
      expect(result).toBeDefined();
      expect(result.email).toBe("user@example.com");
    });

    it("should reject duplicate email", async () => {
      const userData = {
        email: "existing@example.com",
        password: "secure-pass-123",
      };

      supabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "23505" }, // PostgreSQL unique constraint error
        }),
      });

      await expect(authService.registerUser(userData)).rejects.toThrow();
    });
  });

  describe("loginUser", () => {
    it("should authenticate valid credentials", async () => {
      const credentials = {
        email: "user@example.com",
        password: "secure-pass-123",
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            { id: "123", email: "user@example.com", password_hash: "$2b$..." },
          ],
          error: null,
        }),
      });

      const result = await authService.loginUser(credentials);
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      await expect(
        authService.loginUser({
          email: "nonexistent@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow();
    });
  });
});
```

---

## 6. API Testing

API tests validate HTTP endpoints using Supertest.

### Example: Auth Routes API Test

**File: `routes/__tests__/auth.routes.test.js`**

```javascript
const request = require("supertest");
const app = require("../../app");
const supabase = require("../../config/supabase");

jest.mock("../../config/supabase");

describe("Auth Routes", () => {
  describe("POST /api/auth/login", () => {
    it("should return a token on successful login", async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              id: "123",
              email: "user@example.com",
              password_hash: "$2b$10$...", // hashed password
            },
          ],
          error: null,
        }),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "correct-password",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    it("should return 401 on invalid credentials", async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 on validation error", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: "short",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      supabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [
            {
              id: "new-user-id",
              email: "newuser@example.com",
            },
          ],
          error: null,
        }),
      });

      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "secure-password-123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("newuser@example.com");
    });
  });
});
```

---

## 7. End-to-End (E2E) Testing

E2E tests validate complete workflows.

### Example: Order Checkout Flow Test

**File: `__tests__/e2e/checkout.flow.test.js`**

```javascript
const request = require("supertest");
const app = require("../../app");

describe("Checkout Flow (E2E)", () => {
  let authToken;
  let userId = "test-user-id";
  let cartItems = [];
  let orderId;

  beforeAll(async () => {
    // Mock authentication
    authToken = "mock-jwt-token";
  });

  it("should complete an order from cart to payment", async () => {
    // Step 1: Add item to cart
    const addToCartResponse = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        variantId: "variant-123",
        quantity: 2,
      });

    expect(addToCartResponse.status).toBe(200);
    cartItems = addToCartResponse.body.items;

    // Step 2: Create order from cart
    const createOrderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        shippingAddressId: "address-123",
      });

    expect(createOrderResponse.status).toBe(201);
    orderId = createOrderResponse.body.order.id;

    // Step 3: Initialize payment
    const paymentResponse = await request(app)
      .post(`/api/payments/orders/${orderId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body).toHaveProperty("paymentId");

    // Step 4: Verify order status
    const orderResponse = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(orderResponse.status).toBe(200);
    expect(orderResponse.body.order.status).toBe("pending");
  });
});
```

---

## 8. Middleware Testing

Testing middleware functions ensures proper request/response handling.

### Example: Authentication Middleware Test

**File: `middlewares/__tests__/authenticate.test.js`**

```javascript
const authenticate = require("../authenticate");
const jwt = require("../../utils/jwt");

jest.mock("../../utils/jwt");

describe("Authenticate Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it("should attach user to request on valid token", () => {
    const token = "valid-token";
    req.headers.authorization = `Bearer ${token}`;

    jwt.verifyToken.mockReturnValue({
      userId: "123",
      role: "customer",
    });

    authenticate(req, res, next);

    expect(req.user).toEqual({
      userId: "123",
      role: "customer",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no token provided", () => {
    res.status = jest.fn().mockReturnValue({
      json: jest.fn(),
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is invalid", () => {
    req.headers.authorization = "Bearer invalid-token";

    jwt.verifyToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    res.status = jest.fn().mockReturnValue({
      json: jest.fn(),
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

---

## 9. Mocking Strategies

### Mocking Supabase

```javascript
jest.mock("../../config/supabase");

const supabase = require("../../config/supabase");

// Mock a select query
supabase.from = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({
    data: [
      /* your mock data */
    ],
    error: null,
  }),
});

// Mock an insert query
supabase.from = jest.fn().mockReturnValue({
  insert: jest.fn().mockResolvedValue({
    data: [
      /* inserted data */
    ],
    error: null,
  }),
});
```

### Mocking External APIs

```javascript
const nock = require("nock");

describe("Stripe Payment", () => {
  it("should create a payment intent", async () => {
    nock("https://api.stripe.com").post("/v1/payment_intents").reply(200, {
      id: "pi_1234567890",
      status: "succeeded",
    });

    // Your payment code here
  });
});
```

### Mocking Time

```javascript
describe("Token Expiry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should expire token after TTL", () => {
    const token = jwt.generateToken({ userId: "123" }, secret, "1h");

    // Fast-forward time by 1 hour and 1 second
    jest.advanceTimersByTime(3600000 + 1000);

    expect(() => jwt.verifyToken(token, secret)).toThrow();
  });
});
```

---

## 10. Running Tests

### Configuration in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test auth.service.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="login"

# Debug tests
npm run test:debug
```

---

## 11. Test Coverage

Test coverage measures how much of your code is tested.

### Generate Coverage Report

```bash
npm run test:coverage
```

This generates an HTML report in `coverage/index.html`.

### Coverage Targets

Set thresholds in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

---

## 12. Common Testing Patterns

### Testing Error Handling

```javascript
it("should handle database errors gracefully", async () => {
  supabase.from = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Connection timeout" },
    }),
  });

  await expect(
    authService.loginUser({
      email: "user@example.com",
      password: "password",
    }),
  ).rejects.toThrow("Connection timeout");
});
```

### Testing Async Operations

```javascript
it("should handle async operations", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});

// or with done callback
it("should handle async operations with callback", (done) => {
  someAsyncFunction().then((result) => {
    expect(result).toBeDefined();
    done();
  });
});
```

### Testing Array Operations

```javascript
it("should filter cart items correctly", () => {
  const cart = [
    { id: 1, quantity: 2 },
    { id: 2, quantity: 0 },
    { id: 3, quantity: 1 },
  ];

  const filtered = cart.filter((item) => item.quantity > 0);
  expect(filtered).toHaveLength(2);
  expect(filtered.map((i) => i.id)).toEqual([1, 3]);
});
```

### Testing Object Properties

```javascript
it("should have all required user properties", () => {
  const user = { id: "123", email: "user@example.com", role: "customer" };

  expect(user).toHaveProperty("id");
  expect(user).toHaveProperty("email");
  expect(user).toEqual(
    expect.objectContaining({
      email: "user@example.com",
    }),
  );
});
```

---

## 13. Best Practices

### 1. Test Naming

```javascript
// Good
describe("User Registration", () => {
  it("should create a new user with valid email and password", () => {});
});

// Bad
describe("User", () => {
  it("works", () => {});
});
```

### 2. Setup and Teardown

```javascript
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.resetAllMocks();
});

beforeAll(() => {
  // Run once before all tests
});

afterAll(() => {
  // Run once after all tests
});
```

### 3. One Assertion Per Test

```javascript
// Good - focused test
it("should return user email", () => {
  const user = authService.getUser("123");
  expect(user.email).toBe("user@example.com");
});

// Less ideal - multiple assertions
it("should return user with all properties", () => {
  const user = authService.getUser("123");
  expect(user.email).toBe("user@example.com");
  expect(user.name).toBe("Test User");
  expect(user.role).toBe("customer");
});
```

### 4. Avoid Testing Implementation Details

```javascript
// Bad - testing internal implementation
it("should create an object with specific structure", () => {
  const obj = { _internal: true, getData: () => {} };
  expect(obj._internal).toBe(true);
});

// Good - testing behavior
it("should return correct data", () => {
  const data = obj.getData();
  expect(data).toEqual({ id: "123", name: "Test" });
});
```

### 5. Use Descriptive Expectations

```javascript
// Bad
expect(result).toBe(true);

// Good
expect(result).toBeDefined();
expect(result.email).toBe("user@example.com");
```

---

## 14. CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

---

## 15. Testing Controllers

### Example: Product Controller Test

**File: `controllers/__tests__/product.controller.test.js`**

```javascript
const productController = require("../product.controller");
const productService = require("../../services/product.service");

jest.mock("../../services/product.service");

describe("Product Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getProductById", () => {
    it("should return a product by ID", async () => {
      const mockProduct = {
        id: "123",
        name: "T-Shirt",
        price: 29.99,
      };

      productService.getProductById.mockResolvedValue(mockProduct);
      req.params.id = "123";

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ product: mockProduct });
    });

    it("should return 404 if product not found", async () => {
      productService.getProductById.mockResolvedValue(null);
      req.params.id = "nonexistent";

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });
  });
});
```

---

## 16. Key Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file
- `__tests__/` - Test directory
- `package.json` - Test scripts

---

## 17. Summary

A comprehensive testing strategy includes:

1. **Unit tests** for individual functions
2. **Integration tests** for module interactions
3. **API tests** for HTTP endpoints
4. **E2E tests** for complete workflows
5. **Middleware tests** for request/response handling

Follow best practices:

- Clear, descriptive test names
- One assertion per test (ideally)
- Proper mocking of external dependencies
- Setup and teardown hooks
- Meaningful coverage thresholds
- CI/CD integration for automated testing

This ensures code reliability, maintainability, and confidence in deployments.
