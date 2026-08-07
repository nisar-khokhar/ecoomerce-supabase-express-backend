CREATE INDEX idx_products_category_active
ON public.products(category_id, is_active);

CREATE INDEX idx_products_brand_active
ON public.products(brand_id, is_active);