-- ============================================
-- Product Variant Values Table
-- ============================================

CREATE TABLE public.product_variant_values (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_variant_id BIGINT NOT NULL,

    variant_value_id BIGINT NOT NULL,

    CONSTRAINT fk_product_variant_values_variant
        FOREIGN KEY (product_variant_id)
        REFERENCES public.product_variants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_variant_values_value
        FOREIGN KEY (variant_value_id)
        REFERENCES public.variant_values(id)
        ON DELETE CASCADE,

    CONSTRAINT product_variant_values_unique
        UNIQUE(product_variant_id, variant_value_id)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_product_variant_values_variant
ON public.product_variant_values(product_variant_id);

CREATE INDEX idx_product_variant_values_value
ON public.product_variant_values(variant_value_id);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.product_variant_values
IS 'Maps each product variant to one or more selected variant values.';

COMMENT ON COLUMN public.product_variant_values.product_variant_id
IS 'Reference to the product variant.';

COMMENT ON COLUMN public.product_variant_values.variant_value_id
IS 'Reference to the assigned variant value.';