-- ============================================
-- Refine Orders and Order Items
-- ============================================


-- ============================================
-- Orders Payment Status
-- ============================================

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check
CHECK (
    payment_status IN (
        'pending',
        'processing',
        'paid',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded'
    )
);


-- ============================================
-- Order Total Integrity
-- ============================================

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_total_amount_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_total_amount_check
CHECK (
    total_amount =
        subtotal
        + shipping_fee
        - discount_amount
        + tax_amount
);


-- ============================================
-- Order Items
-- ============================================

DROP TRIGGER IF EXISTS trigger_order_items_updated_at
ON public.order_items;

ALTER TABLE public.order_items
DROP COLUMN IF EXISTS updated_at;


-- ============================================
-- Order Item Financial Integrity
-- ============================================

ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_subtotal_check;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_subtotal_check
CHECK (
    subtotal = quantity * unit_price
);