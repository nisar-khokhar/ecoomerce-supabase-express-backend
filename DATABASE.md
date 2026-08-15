# Database Documentation

This project uses Supabase PostgreSQL as its primary database. The backend is built around a relational schema for products, users, cart, orders, payments, reviews, coupons, and inventory tracking.

The database is managed through migration files in the Supabase project folder, and the application interacts with it through the Supabase client configured in the server.

---

## 1. Database Overview

The schema is designed to support a complete e-commerce flow:

- Users register accounts and manage addresses
- Admins create categories, brands, products, and variants
- Customers build carts and add wishlist items
- Orders are created from the active cart
- Payment records are attached to orders
- Reviews are linked to products and users
- Inventory movement logs track changes and cancellations
- Coupons can apply to products, categories, and orders

---

## 2. Core Tables

### users

Stores application users.

Main fields:

- id: UUID primary key
- first_name
- last_name
- email
- phone
- password_hash
- role
- is_active
- created_at
- updated_at

Relationships:

- one-to-many with user_addresses
- one-to-many with carts
- one-to-many with orders
- one-to-many with wishlist entries
- one-to-many with reviews

---

### user_addresses

Stores customer shipping and billing addresses.

Main fields:

- id
- user_id
- label
- recipient_name
- phone
- address_line_1
- address_line_2
- city
- province
- postal_code
- country_code
- delivery_notes
- is_default
- created_at
- updated_at

Important note:

- The order table stores a snapshot of shipping_address and billing_address as JSON, so the address data is copied at order time instead of linked dynamically.

---

### categories

Stores product taxonomy.

Main fields:

- id
- name
- slug
- description
- parent_id (if hierarchical support exists)
- is_active
- created_at
- updated_at

Relationships:

- one-to-many with products
- many-to-many with coupons through coupon_categories

---

### brands

Stores product manufacturers or brands.

Main fields:

- id
- name
- slug
- description
- logo_url
- is_active
- created_at
- updated_at

Relationships:

- one-to-many with products

---

### products

Represents the main catalog item.

Main fields:

- id
- category_id
- brand_id
- name
- slug
- short_description
- description
- price
- compare_price
- is_featured
- is_active
- created_at
- updated_at

Relationships:

- belongs to category and brand
- one-to-many with product_images
- one-to-many with product_variants
- one-to-many with product_reviews
- many-to-many with coupon_products

---

### product_images

Stores product gallery images.

Main fields:

- id
- product_id
- image_path
- alt_text
- sort_order
- is_primary
- created_at

Usage:

- Used to display product media and primary image selection.

---

### variant_types

Defines product attribute types such as Color, Size, Storage, and Material.

Main fields:

- id
- name
- created_at

Relationships:

- one-to-many with variant_values

---

### variant_values

Stores actual values for a variant type.

Main fields:

- id
- variant_type_id
- value_code
- label
- created_at

Example values:

- Size: S, M, L
- Color: Red, Black
- Storage: 128GB, 256GB

---

### product_variants

Represents the actual sellable variant of a product.

Main fields:

- id
- product_id
- sku
- barcode
- price
- compare_price
- quantity
- weight
- track_inventory
- is_active
- created_at
- updated_at

Important note:

- This is the inventory and pricing unit used in the cart and order flow.
- Cart items reference product_variant_id directly.

Relationships:

- belongs to products
- one-to-many with product_variant_values
- one-to-many with cart_items
- one-to-many with order_items
- one-to-many with inventory_movements

---

### product_variant_values

Maps a product variant to specific variant values.

Main fields:

- id
- product_variant_id
- variant_value_id
- created_at

Purpose:

- Connects a specific variant to the selected attribute values, such as Color = Red and Storage = 128GB.

---

### wishlist

Stores user product wishes.

Main fields:

- id
- user_id
- product_id
- created_at

Purpose:

- Allows users to save products for later.

---

### carts

Stores one cart per user.

Main fields:

- id
- user_id
- created_at
- updated_at

Constraint:

- Each user has exactly one cart record.

Relationships:

- one-to-one with users
- one-to-many with cart_items

---

### cart_items

Stores products currently added to the cart.

Main fields:

- id
- cart_id
- product_variant_id
- quantity
- created_at
- updated_at

Constraints:

- quantity > 0
- one product variant per cart only once

Purpose:

- Represents the current shopping cart state for a user.

---

### orders

Stores customer orders and snapshots taken at checkout time.

Main fields:

- id
- user_id
- order_number
- status
- payment_status
- shipping_address (JSONB)
- billing_address (JSONB)
- subtotal
- shipping_fee
- discount_amount
- tax_amount
- total_amount
- coupon_id
- created_at
- updated_at

Important behavior:

- This table stores a frozen copy of order data rather than live references to the cart or product record.
- The order is intended to remain stable even if the product or address later changes.

Status examples:

- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- refunded

Payment status examples:

- pending
- paid
- failed
- refunded
- partially_refunded

---

### order_items

Stores each item included in an order as an immutable snapshot.

Main fields:

- id
- order_id
- product_variant_id
- product_name
- variant_sku
- variant_attributes (JSONB)
- quantity
- unit_price
- subtotal
- created_at
- updated_at

Purpose:

- Captures product details and pricing at the time of order creation.
- Prevents order records from changing when live product data changes.

---

### payments

Tracks every payment attempt or payment record for an order.

Main fields:

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

Provider values:

- stripe
- xpay

---

### refunds

Tracks refund requests and refund results related to orders.

Main fields:

- id
- order_id
- payment_id
- amount
- reason
- status
- created_at
- updated_at

Purpose:

- Supports refund lifecycle and cancellation handling.

---

### product_reviews

Stores product reviews posted by users.

Main fields:

- id
- product_id
- user_id
- rating
- title
- review
- is_verified_purchase
- is_approved
- created_at
- updated_at

Constraints:

- rating between 1 and 5
- one review per user per product

---

### inventory_movements

Logs stock changes for product variants.

Main fields:

- id
- product_variant_id
- type
- quantity
- previous_quantity
- new_quantity
- reason
- reference_type
- reference_id
- created_by
- created_at

Movement types:

- sale
- restock
- manual_adjustment
- return
- cancellation

Purpose:

- Useful for audit trails and stock reconciliation.

---

### coupons

Stores promotional coupons.

Main fields:

- id
- code
- description
- discount_type
- discount_value
- minimum_order_amount
- maximum_discount_amount
- usage_limit
- usage_limit_per_user
- first_order_only
- starts_at
- expires_at
- is_active
- created_at
- updated_at

Discount types:

- percentage
- fixed

Purpose:

- Applies discounts to eligible orders.

---

### coupon_products

Many-to-many mapping between coupons and specific products.

Main fields:

- coupon_id
- product_id
- created_at

---

### coupon_categories

Many-to-many mapping between coupons and categories.

Main fields:

- coupon_id
- category_id
- created_at

---

### coupon_usages

Tracks coupon usage history per order and user.

Main fields:

- id
- coupon_id
- user_id
- order_id
- discount_amount
- created_at

Purpose:

- Helps enforce coupon use limits and historical validation.

---

## 3. Relationship Summary

The main relational relationships are:

- users -> user_addresses
- users -> carts
- carts -> cart_items
- users -> orders
- orders -> order_items
- orders -> payments
- orders -> refunds
- products -> product_variants
- product_variants -> product_variant_values
- variant_types -> variant_values
- products -> product_reviews
- users -> product_reviews
- product_variants -> inventory_movements
- coupons -> coupon_products
- coupons -> coupon_categories
- coupons -> coupon_usages

---

## 4. Design Patterns Used in the Schema

### Snapshot-based order records

Orders and order items record a copy of data at checkout instead of live references to cart rows. This protects historical records from later product or address changes.

### JSONB for address snapshots

Shipping and billing data are stored in JSONB so a full address snapshot is preserved per order.

### Variant-level inventory

Inventory is tracked on product_variants, not on products. This makes item-level stock handling more precise.

### Immutable order items

Order items are kept as a historical ledger of what was bought, including product name, variant SKU, attributes, and purchased quantity.

### Inventory movement audit logs

Inventory changes are logged to inventory_movements so admins can trace sales, returns, cancellations, and manual adjustments.

---

## 5. Important Business Logic Notes

- A user only has one cart record.
- A cart item is unique per cart and product variant.
- Orders are created from the cart and validated against current product and inventory state.
- Order items are created as snapshots during checkout.
- Payment and refund records are distinct from order records and follow their own lifecycle states.
- Coupon usage is tracked to prevent repeat or invalid usage.

---

## 6. Migration Structure

The project includes a set of Supabase migrations that progressively build the database schema. These migrations handle:

- base tables
- indexes and triggers
- inventory logic
- payment and refund support
- review moderation
- coupon system
- order snapshot refinements

This migration-oriented setup makes the database versioned, traceable, and easy to redeploy in a fresh environment.

---

## 7. Example Data Flow

A common e-commerce flow in this database looks like this:

1. User signs up and creates addresses.
2. User adds product variants to cart_items.
3. Order is created from cart_items.
4. Order order_items snapshots are inserted.
5. Payment is created for the order.
6. Inventory is adjusted using inventory_movements.
7. Review can be added later for the purchased product.
8. Coupon usage may be recorded against the order.

---

## 8. Summary

This database schema supports a complete storefront backend with:

- catalog management
- customer account and address management
- cart and wishlist features
- order processing and payment tracking
- refund handling
- review system
- admin inventory and coupon controls

It is structured for real-world commerce use with strong emphasis on order integrity, inventory correctness, and traceable audit data.
