-- ============================================
-- Remove Variant-Level Fields From Products
-- ============================================

ALTER TABLE public.products
DROP COLUMN IF EXISTS sku,
DROP COLUMN IF EXISTS price,
DROP COLUMN IF EXISTS compare_price,
DROP COLUMN IF EXISTS quantity;