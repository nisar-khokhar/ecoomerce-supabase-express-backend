-- ============================================
-- Products Table
-- ============================================

CREATE TABLE public.products (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id BIGINT NOT NULL,

    brand_id BIGINT NOT NULL,

    name TEXT NOT NULL,

    slug TEXT NOT NULL,

    sku TEXT NOT NULL,

    short_description TEXT,

    description TEXT,

    price NUMERIC(10,2) NOT NULL
        CHECK (price > 0),

    compare_price NUMERIC(10,2)
        CHECK (compare_price IS NULL OR compare_price >= price),

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    thumbnail_path TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT products_slug_unique
        UNIQUE(slug),

    CONSTRAINT products_sku_unique
        UNIQUE(sku),

    CONSTRAINT fk_products_category
        FOREIGN KEY(category_id)
        REFERENCES public.categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_products_brand
        FOREIGN KEY(brand_id)
        REFERENCES public.brands(id)
        ON DELETE RESTRICT
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_products_category
ON public.products(category_id);

CREATE INDEX idx_products_brand
ON public.products(brand_id);

CREATE INDEX idx_products_active
ON public.products(is_active);

CREATE INDEX idx_products_featured
ON public.products(is_featured);

CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE
ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.products
IS 'Stores products available for sale.';