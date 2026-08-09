-- ============================================
-- Carts Table
-- ============================================

CREATE TABLE public.carts (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    CONSTRAINT carts_user_unique
        UNIQUE(user_id)
);

-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_carts_user
ON public.carts(user_id);

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_carts_updated_at
BEFORE UPDATE
ON public.carts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comment
-- ============================================

COMMENT ON TABLE public.carts
IS 'Stores one shopping cart for each user.';

-- ============================================
-- Cart Items Table
-- ============================================

CREATE TABLE public.cart_items (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    cart_id BIGINT NOT NULL,

    product_variant_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES public.carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (product_variant_id)
        REFERENCES public.product_variants(id)
        ON DELETE RESTRICT,

    CONSTRAINT cart_items_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT cart_items_variant_unique
        UNIQUE(cart_id, product_variant_id)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_cart_items_cart
ON public.cart_items(cart_id);

CREATE INDEX idx_cart_items_variant
ON public.cart_items(product_variant_id);

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_cart_items_updated_at
BEFORE UPDATE
ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.cart_items
IS 'Stores product variants added to shopping carts.';

COMMENT ON COLUMN public.cart_items.product_variant_id
IS 'References the exact product variant selected by the customer.';

COMMENT ON COLUMN public.cart_items.quantity
IS 'Number of units of the selected product variant.';