-- ============================================
-- Product Images Table
-- ============================================

CREATE TABLE public.product_images (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL,

    image_path TEXT NOT NULL,

    alt_text TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_product_images_product
ON public.product_images(product_id);

CREATE INDEX idx_product_images_sort_order
ON public.product_images(product_id, sort_order);

-- Only one primary image per product
CREATE UNIQUE INDEX idx_product_primary_image
ON public.product_images(product_id)
WHERE is_primary = TRUE;

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_product_images_updated_at
BEFORE UPDATE
ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.product_images
IS 'Stores multiple images for each product.';

COMMENT ON COLUMN public.product_images.image_path
IS 'Relative path of the image stored in Supabase Storage.';