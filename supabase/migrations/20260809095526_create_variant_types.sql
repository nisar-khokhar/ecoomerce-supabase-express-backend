-- ============================================
-- Variant Types Table
-- ============================================

CREATE TABLE public.variant_types (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT variant_types_name_unique
        UNIQUE(name)
);

COMMENT ON TABLE public.variant_types
IS 'Stores product attribute types such as Color, Size, Storage, RAM, etc.';

COMMENT ON COLUMN public.variant_types.name
IS 'Unique name of the variant type.';