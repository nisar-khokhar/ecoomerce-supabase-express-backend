# Node Express CRUD

A polished CRUD API built with Node.js, Express, and Supabase. This project manages products, categories, and brands with server-side validation, query filtering, pagination, sorting, and image relations.

## 🚀 Project Overview

This application is a backend API for an e-commerce-style product management system. It uses:

- Express for routing and middleware
- Supabase as the database client
- Zod for request validation
- Modular controllers, services, and routes for clean separation of concerns
- Query builder helpers for flexible product filtering, sorting, and pagination

## ✨ Current Feature Set

- Products
  - Create, read, update, delete
  - Filtering by category, brand, featured, and active status
  - Search by product name
  - Sorting by `price`, `name`, or `created_at`
  - Pagination support
  - Includes related category, brand, and product image data

- Categories
  - Create, read, update, delete
  - Sorted by `sort_order`

- Brands
  - Create, read, update, delete
  - Sorted by name

- Request validation for payloads and route parameters using Zod
- Centralized error handling and async middleware handling

## 📁 Project Structure

- `app.js` — main Express app configuration
- `bin/www` — server startup script
- `routes/` — route definitions for categories, brands, products
- `controllers/` — request handlers and response formatting
- `services/` — business logic and Supabase database operations
- `validators/` — Zod schema validation for requests
- `middlewares/` — validation, async error handling, and error responses
- `helpers/` — reusable query builder helpers for product filtering
- `config/` — Supabase client configuration
- `public/` — static file serving folder
- `supabase/` — database migration and seed files

## 🧩 Prerequisites

- Node.js 18+ recommended
- Supabase project with database tables for `products`, `categories`, `brands`, and `product_images`
- Environment variables configured locally

## ⚙️ Environment Variables

Create a `.env.local` file for development or `.env` for production with:

```env
PORT=3000
SUPABASE_URL=<your-supabase-url>
SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

> Note: The project currently uses `SUPABASE_PUBLISHABLE_KEY` in `config/supabase.js`. For production use, replace this with your Supabase service role or secret key as appropriate.

## 🧪 Install and Run

```bash
npm install
npm run dev
```

Or start the production server:

```bash
npm start
```

The server listens on `http://localhost:3000` by default.

## 🔗 API Endpoints

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

### Brands

- `GET /api/brands`
- `GET /api/brands/:id`
- `POST /api/brands`
- `PATCH /api/brands/:id`
- `DELETE /api/brands/:id`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Product Query Parameters

Supported query parameters for `GET /api/products`:

- `page` — page number
- `limit` — items per page
- `search` — search by product name
- `category` — category ID filter
- `brand` — brand ID filter
- `featured` — boolean filter
- `active` — boolean filter
- `sort` — `price`, `name`, or `created_at`
- `order` — `asc` or `desc`

## 📌 Notes

- Validation is enforced at the route level, so invalid requests return structured errors.
- Product endpoints return related categories, brands, and product images where available.
- The app serves static files from `public/`.

## 🛠️ Next Improvements

Potential next steps for the project:

- Add authentication/authorization
- Add product image upload handling
- Add frontend or admin dashboard
- Add more comprehensive API documentation with Swagger/OpenAPI
- Use Supabase service role key securely instead of publishable key

---

Made with Node.js, Express, and Supabase as the current backend foundation for a product catalog CRUD system.
