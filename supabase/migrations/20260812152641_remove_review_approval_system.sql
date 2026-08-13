ALTER TABLE public.product_reviews
DROP CONSTRAINT IF EXISTS product_reviews_approved;

DROP INDEX IF EXISTS idx_product_reviews_approved;

DROP INDEX IF EXISTS idx_product_reviews_product_approved;

ALTER TABLE public.product_reviews
DROP COLUMN IF EXISTS is_approved;