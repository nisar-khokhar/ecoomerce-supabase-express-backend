-- ============================================
-- Wishlist Table
-- ============================================

CREATE TABLE public.wishlist (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL,

    product_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_product
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE,

    CONSTRAINT wishlist_user_product_unique
        UNIQUE (user_id, product_id)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_wishlist_user
ON public.wishlist(user_id);

CREATE INDEX idx_wishlist_product
ON public.wishlist(product_id);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.wishlist
IS 'Stores products saved by users for future purchase.';

COMMENT ON COLUMN public.wishlist.user_id
IS 'Owner of the wishlist item.';

COMMENT ON COLUMN public.wishlist.product_id
IS 'Product added to the wishlist.';