-- ============================================
-- Refine Order Status
-- ============================================

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (
    status IN (
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    )
);

-- ============================================
-- Normalize Existing Refunded Orders
-- ============================================

UPDATE public.orders
SET
    status = 'cancelled',
    updated_at = NOW()
WHERE status = 'refunded';

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN public.orders.status
IS 'Fulfillment lifecycle status of the order. Payment state is tracked separately by payment_status.';