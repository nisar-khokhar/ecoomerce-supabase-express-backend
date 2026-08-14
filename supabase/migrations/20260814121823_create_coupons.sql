-- ============================================
-- Coupons
-- ============================================

CREATE TABLE public.coupons (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    code TEXT NOT NULL,

    description TEXT,

    discount_type TEXT NOT NULL,

    discount_value NUMERIC(12,2) NOT NULL,

    minimum_order_amount NUMERIC(12,2)
        NOT NULL DEFAULT 0,

    maximum_discount_amount NUMERIC(12,2),

    usage_limit INTEGER,

    usage_limit_per_user INTEGER,

    first_order_only BOOLEAN NOT NULL DEFAULT FALSE,

    starts_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ==========================================
    -- Discount Type
    -- ==========================================

    CONSTRAINT coupons_discount_type_check
        CHECK (
            discount_type IN (
                'percentage',
                'fixed'
            )
        ),

    -- ==========================================
    -- Discount Value
    -- ==========================================

    CONSTRAINT coupons_discount_value_check
        CHECK (
            discount_value > 0
        ),

    -- ==========================================
    -- Percentage Discount
    -- ==========================================

    CONSTRAINT coupons_percentage_value_check
        CHECK (
            discount_type <> 'percentage'
            OR discount_value <= 100
        ),

    -- ==========================================
    -- Minimum Order Amount
    -- ==========================================

    CONSTRAINT coupons_minimum_order_check
        CHECK (
            minimum_order_amount >= 0
        ),

    -- ==========================================
    -- Maximum Discount
    -- ==========================================

    CONSTRAINT coupons_maximum_discount_check
        CHECK (
            maximum_discount_amount IS NULL
            OR maximum_discount_amount > 0
        ),

    -- ==========================================
    -- Usage Limit
    -- ==========================================

    CONSTRAINT coupons_usage_limit_check
        CHECK (
            usage_limit IS NULL
            OR usage_limit > 0
        ),

    -- ==========================================
    -- Per User Usage Limit
    -- ==========================================

    CONSTRAINT coupons_usage_limit_per_user_check
        CHECK (
            usage_limit_per_user IS NULL
            OR usage_limit_per_user > 0
        ),

    -- ==========================================
    -- Date Range
    -- ==========================================

    CONSTRAINT coupons_date_range_check
        CHECK (
            expires_at IS NULL
            OR starts_at IS NULL
            OR expires_at > starts_at
        )
);


-- ============================================
-- Unique Coupon Code
-- ============================================

CREATE UNIQUE INDEX coupons_code_unique_idx
ON public.coupons (LOWER(code));


-- ============================================
-- Coupon Indexes
-- ============================================

CREATE INDEX idx_coupons_is_active
ON public.coupons (is_active);

CREATE INDEX idx_coupons_starts_at
ON public.coupons (starts_at);

CREATE INDEX idx_coupons_expires_at
ON public.coupons (expires_at);


-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_coupons_updated_at
BEFORE UPDATE
ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- Coupon Products
-- ============================================

CREATE TABLE public.coupon_products (
    coupon_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (
        coupon_id,
        product_id
    ),

    CONSTRAINT coupon_products_coupon_fk
        FOREIGN KEY (coupon_id)
        REFERENCES public.coupons(id)
        ON DELETE CASCADE,

    CONSTRAINT coupon_products_product_fk
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE
);


-- ============================================
-- Coupon Product Index
-- ============================================

CREATE INDEX idx_coupon_products_product
ON public.coupon_products(product_id);


-- ============================================
-- Coupon Categories
-- ============================================

CREATE TABLE public.coupon_categories (
    coupon_id BIGINT NOT NULL,

    category_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (
        coupon_id,
        category_id
    ),

    CONSTRAINT coupon_categories_coupon_fk
        FOREIGN KEY (coupon_id)
        REFERENCES public.coupons(id)
        ON DELETE CASCADE,

    CONSTRAINT coupon_categories_category_fk
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id)
        ON DELETE CASCADE
);


-- ============================================
-- Coupon Category Index
-- ============================================

CREATE INDEX idx_coupon_categories_category
ON public.coupon_categories(category_id);


-- ============================================
-- Coupon Usage
-- ============================================

CREATE TABLE public.coupon_usages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    coupon_id BIGINT NOT NULL,

    user_id UUID NOT NULL,

    order_id BIGINT NOT NULL,

    discount_amount NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT coupon_usages_coupon_fk
        FOREIGN KEY (coupon_id)
        REFERENCES public.coupons(id)
        ON DELETE RESTRICT,

    CONSTRAINT coupon_usages_user_fk
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE RESTRICT,

    CONSTRAINT coupon_usages_order_fk
        FOREIGN KEY (order_id)
        REFERENCES public.orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT coupon_usages_discount_check
        CHECK (
            discount_amount >= 0
        ),

    -- A coupon can only be recorded once
    -- for the same order.
    CONSTRAINT coupon_usages_order_unique
        UNIQUE (
            coupon_id,
            order_id
        )
);


-- ============================================
-- Coupon Usage Indexes
-- ============================================

CREATE INDEX idx_coupon_usages_coupon
ON public.coupon_usages(coupon_id);

CREATE INDEX idx_coupon_usages_user
ON public.coupon_usages(user_id);

CREATE INDEX idx_coupon_usages_order
ON public.coupon_usages(order_id);

CREATE INDEX idx_coupon_usages_coupon_user
ON public.coupon_usages(
    coupon_id,
    user_id
);


-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.coupons
IS 'Stores promotional coupon rules and eligibility configuration.';

COMMENT ON COLUMN public.coupons.code
IS 'Unique customer-facing coupon code.';

COMMENT ON COLUMN public.coupons.discount_type
IS 'Determines whether the discount is percentage-based or fixed amount.';

COMMENT ON COLUMN public.coupons.discount_value
IS 'Discount value. Percentage coupons must be between 0 and 100.';

COMMENT ON COLUMN public.coupons.minimum_order_amount
IS 'Minimum eligible order subtotal required to use the coupon.';

COMMENT ON COLUMN public.coupons.maximum_discount_amount
IS 'Maximum discount amount allowed for percentage coupons.';

COMMENT ON COLUMN public.coupons.usage_limit
IS 'Maximum number of successful coupon uses across all customers. NULL means unlimited.';

COMMENT ON COLUMN public.coupons.usage_limit_per_user
IS 'Maximum successful uses per customer. NULL means unlimited.';

COMMENT ON COLUMN public.coupons.first_order_only
IS 'Determines whether the coupon is restricted to customers without a previous successful purchase.';

COMMENT ON COLUMN public.coupons.starts_at
IS 'Timestamp from which the coupon becomes valid.';

COMMENT ON COLUMN public.coupons.expires_at
IS 'Timestamp after which the coupon is no longer valid.';

COMMENT ON TABLE public.coupon_products
IS 'Associates coupons with specific products.';

COMMENT ON TABLE public.coupon_categories
IS 'Associates coupons with specific product categories.';

COMMENT ON TABLE public.coupon_usages
IS 'Records successful coupon usage for audit and usage-limit enforcement.';