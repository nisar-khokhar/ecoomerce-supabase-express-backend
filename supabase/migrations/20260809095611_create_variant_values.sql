
-- ============================================
-- Variant Values Table
-- ============================================

CREATE TABLE public.variant_values (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    variant_type_id BIGINT NOT NULL,

    value_code TEXT NOT NULL,

    label TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_variant_values_type
        FOREIGN KEY (variant_type_id)
        REFERENCES public.variant_types(id)
        ON DELETE CASCADE,

    CONSTRAINT variant_values_label_unique
        UNIQUE (variant_type_id, label),

    CONSTRAINT variant_values_code_unique
        UNIQUE (variant_type_id, value_code)
);


COMMENT ON TABLE public.variant_values
IS 'Stores possible values for each product variant type.';

COMMENT ON COLUMN public.variant_values.value_code
IS 'Stable internal identifier used by the application, integrations and inventory systems.';

COMMENT ON COLUMN public.variant_values.label
IS 'Human-readable value displayed to customers and administrators.';