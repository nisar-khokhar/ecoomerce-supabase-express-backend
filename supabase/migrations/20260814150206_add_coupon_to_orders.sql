-- ============================================
-- Add Coupon Reference To Orders
-- ============================================

ALTER TABLE public.orders
ADD COLUMN coupon_id BIGINT;

-- ============================================
-- Foreign Key
-- ============================================

ALTER TABLE public.orders
ADD CONSTRAINT orders_coupon_id_fk
FOREIGN KEY (coupon_id)
REFERENCES public.coupons(id)
ON DELETE SET NULL;

-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_orders_coupon_id
ON public.orders(coupon_id);

-- ============================================
-- Comment
-- ============================================

COMMENT ON COLUMN public.orders.coupon_id
IS 'Coupon applied to the order, if any.';