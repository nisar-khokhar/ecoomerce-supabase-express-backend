-- ============================================
-- Categories Table
-- ============================================

CREATE TABLE public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name TEXT NOT NULL,

    slug TEXT NOT NULL,

    description TEXT,

    image_path TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT categories_name_unique UNIQUE (name),

    CONSTRAINT categories_slug_unique UNIQUE (slug)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_categories_active_sort
ON public.categories(is_active, sort_order);

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE
ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments (Optional)
-- ============================================

COMMENT ON TABLE public.categories
IS 'Stores product categories.';

COMMENT ON COLUMN public.categories.slug
IS 'SEO-friendly URL identifier.';