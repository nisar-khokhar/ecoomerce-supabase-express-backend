-- ============================================
-- Product Reviews
-- ============================================

CREATE TABLE public.product_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id BIGINT NOT NULL,

    user_id UUID NOT NULL,

    rating INTEGER NOT NULL,

    title TEXT,

    review TEXT,

    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,

    is_approved BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Product relationship
    CONSTRAINT product_reviews_product_fk
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE,

    -- Application user relationship
    CONSTRAINT product_reviews_user_fk
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    -- Rating must be 1-5
    CONSTRAINT product_reviews_rating_check
        CHECK (rating >= 1 AND rating <= 5),

    -- One review per user per product
    CONSTRAINT product_reviews_unique_user_product
        UNIQUE (product_id, user_id)
);


-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_product_reviews_product_id
ON public.product_reviews(product_id);

CREATE INDEX idx_product_reviews_user_id
ON public.product_reviews(user_id);

CREATE INDEX idx_product_reviews_approved
ON public.product_reviews(is_approved);

CREATE INDEX idx_product_reviews_product_approved
ON public.product_reviews(product_id, is_approved);