# Inventory Documentation

This document explains how inventory and stock management work in this project, including product variants, stock tracking, admin operations, and the order fulfillment workflow.

---

## 1. Overview

Inventory management tracks available stock for products and their variants. When an order is placed, stock is decremented. When an order is refunded or cancelled, stock is restored.

The system supports:

- product variant stock tracking
- low stock detection for admin alerts
- stock deduction on order confirmation
- stock restoration on order cancellation or refund
- admin inventory adjustment operations

---

## 2. Inventory Model

Stock is tracked at the variant level, not the product level. Each variant has its own stock count.

Key fields in the inventory/variant table:

- id
- product_id
- variant_id
- sku
- quantity_available (current stock)
- quantity_reserved (stock held for pending orders)
- quantity_sold (historical count)
- reorder_level (threshold for low-stock alerts)
- created_at
- updated_at

The actual structure may vary; check your Supabase schema for exact column names.

---

## 3. Variants and Product Structure

Each product can have multiple variants. Variants are distinguished by:

- color
- size
- material
- or other custom attributes

Example:

```
Product: T-Shirt
├── Variant 1: Red, Size M
├── Variant 2: Red, Size L
├── Variant 3: Blue, Size M
└── Variant 4: Blue, Size L
```

Each variant has its own inventory record and pricing.

---

## 4. Admin Inventory Routes

Protected admin endpoints:

### Get all inventory

```http
GET /api/admin-inventory
```

Returns all inventory records across all products and variants.

### Get inventory by product

```http
GET /api/admin-inventory/:productId
```

Returns all variants and their stock for a specific product.

### Adjust inventory

```http
PUT /api/admin-inventory/:variantId
```

Allows admins to manually adjust stock quantities (e.g., for damaged goods, shrinkage, or receiving new stock).

Example payload:

```json
{
  "quantity_available": 50,
  "reorder_level": 10
}
```

### Bulk adjust

Some implementations support bulk operations:

```http
POST /api/admin-inventory/bulk-adjust
```

This lets admins update multiple variants at once.

---

## 5. Stock Deduction on Order

When an order is created from a cart:

1. Cart items are validated.
2. Each cart item's variant stock is checked.
3. If sufficient stock exists, the order is created.
4. Stock is decremented for each variant.
5. Order status is set to `pending` or `confirmed`.

This happens in:

- services/order.service.js
- services/productVariant.service.js

---

## 6. Stock Restoration on Refund or Cancellation

If an order is cancelled or refunded:

1. Refund is created with order and payment data.
2. Order status is updated to `cancelled` or `refunded`.
3. Each order line item's variant stock is restored.
4. If partial refund, only that portion's stock is restored.

This logic lives in:

- services/refund.service.js
- services/order.service.js

---

## 7. Low Stock Alerts

Admins can set a `reorder_level` for each variant. When stock falls below this level:

- admin dashboard may display a low-stock warning
- reports can be generated to alert purchasing teams
- automated emails or notifications can be sent (if implemented)

The admin dashboard likely has a section showing:

```
Variant Name | SKU | Current Stock | Reorder Level | Status
T-Shirt Red M | TRED-M | 2 | 10 | ⚠️ LOW STOCK
```

---

## 8. Inventory Sync with Orders

The system should maintain a consistent relationship between:

- `quantity_available` on the inventory record
- `quantity_reserved` for pending orders (if tracked separately)
- actual order item quantities

A reconciliation or audit process may be needed to catch discrepancies (e.g., if an order crashes mid-creation).

---

## 9. Admin Inventory Controller

Location:

- controllers/admin-inventory.controller.js

Common operations:

```javascript
// Get all inventory
getInventory();

// Get inventory for a product
getProductInventory();

// Adjust inventory
adjustInventory();

// Bulk adjust
bulkAdjustInventory();

// Get low stock items
getLowStockItems();
```

---

## 10. Product Variant Service

Location:

- services/productVariant.service.js

This service handles:

- creating and updating variants
- fetching variant details
- managing variant stock
- applying discounts or pricing rules by variant

---

## 11. Inventory Reporting

Admins can generate reports from the admin dashboard:

- total inventory by product
- low-stock alerts
- inventory turnover
- sold vs. available ratios

This information may be available through:

```http
GET /api/admin-dashboard/inventory-summary
GET /api/admin-sales-analytics/inventory-analytics
```

---

## 12. Warehouse or Multi-Location Support

The basic schema tracks a single inventory pool. For multi-warehouse setups:

- you would add a `location_id` or `warehouse_id` field
- each location has its own stock record per variant
- orders specify which location to pull from
- transfers between locations are tracked separately

This project may or may not support multi-location; check your schema design.

---

## 13. Stock Expiration and Lot Management

For perishable or lot-tracked goods:

- add `expiration_date` or `batch_number` fields
- track stock by lot or batch
- implement first-in-first-out (FIFO) logic in order fulfillment

This is optional and depends on your business model.

---

## 14. Security and Admin Checks

Inventory adjustment endpoints should:

- verify the user is authenticated and is an admin
- log all inventory changes for audit trails
- validate input quantities (no negative stock, no impossibly large adjustments)
- send notifications to relevant staff when adjustments occur

---

## 15. Key Files

- controllers/admin-inventory.controller.js
- services/admin-inventory.service.js
- services/productVariant.service.js
- services/order.service.js
- services/refund.service.js
- routes/admin-inventory.routes.js
- config/supabase.js

---

## 16. Integration with Other Modules

Inventory depends on:

- **Products**: variants belong to products
- **Orders**: stock is decremented when orders are created
- **Refunds**: stock is restored when orders are refunded
- **Admin Dashboard**: inventory stats are displayed to admins
- **Sales Analytics**: inventory turnover is part of reporting

---

## 17. Best Practices

1. **Always validate stock before creating an order.**
2. **Use transactions or atomic operations to prevent race conditions** when multiple orders are placed simultaneously.
3. **Log all inventory adjustments** for audit and compliance.
4. **Monitor low-stock levels** and alert purchasing teams proactively.
5. **Reconcile inventory regularly** to catch and fix discrepancies.
6. **Avoid negative stock** in production; implement constraints in the database.
7. **Test refund and cancellation flows** thoroughly to ensure stock is properly restored.

---

## 18. Summary

Inventory management is a core part of the e-commerce backend. Stock is tracked at the variant level, decremented on order creation, and restored on cancellation or refund. Admins can manually adjust inventory and monitor low-stock items. The system is designed to keep inventory synchronized with orders and payment/refund states.

This setup is suitable for a production e-commerce platform with multiple variants and active order fulfillment.
