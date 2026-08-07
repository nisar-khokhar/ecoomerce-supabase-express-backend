-- ============================================
-- Brands Table
-- ============================================

CREATE TABLE public.brands (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name TEXT NOT NULL,

    slug TEXT NOT NULL,

    description TEXT,

    logo_path TEXT,

    website TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT brands_name_unique
        UNIQUE (name),

    CONSTRAINT brands_slug_unique
        UNIQUE (slug)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_brands_active
ON public.brands(is_active);

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_brands_updated_at
BEFORE UPDATE
ON public.brands
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.brands
IS 'Stores product brands and manufacturers.';