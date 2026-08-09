-- ============================================
-- Product Variants Table
-- ============================================

CREATE TABLE public.product_variants (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL,

    sku TEXT NOT NULL,

    barcode TEXT UNIQUE,

    price NUMERIC(10,2) NOT NULL
        CHECK (price > 0),

    compare_price NUMERIC(10,2)
        CHECK (
            compare_price IS NULL
            OR compare_price >= price
        ),

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    weight NUMERIC(10,3)
        CHECK (
            weight IS NULL
            OR weight >= 0
        ),

    track_inventory BOOLEAN NOT NULL DEFAULT TRUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE,

    CONSTRAINT product_variants_sku_unique
        UNIQUE (sku)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_product_variants_product
ON public.product_variants(product_id);

CREATE INDEX idx_product_variants_active
ON public.product_variants(is_active);

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_product_variants_updated_at
BEFORE UPDATE
ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.product_variants
IS 'Stores sellable inventory variants for products.';

COMMENT ON COLUMN public.product_variants.sku
IS 'Unique internal stock keeping unit for the product variant.';

COMMENT ON COLUMN public.product_variants.barcode
IS 'Optional globally unique barcode (EAN, UPC, GTIN, ISBN, etc.) for the product variant.';

COMMENT ON COLUMN public.product_variants.price
IS 'Selling price of the product variant.';

COMMENT ON COLUMN public.product_variants.compare_price
IS 'Original price used for discount comparison.';

COMMENT ON COLUMN public.product_variants.quantity
IS 'Available inventory quantity for the product variant.';

COMMENT ON COLUMN public.product_variants.weight
IS 'Optional weight of the product variant in kilograms.';

COMMENT ON COLUMN public.product_variants.track_inventory
IS 'Determines whether inventory should be tracked for this product variant.';

COMMENT ON COLUMN public.product_variants.is_active
IS 'Determines whether the product variant is available for purchase.';