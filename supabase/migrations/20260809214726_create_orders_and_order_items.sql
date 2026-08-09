-- ============================================
-- Orders Table
-- ============================================

CREATE TABLE public.orders (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL,

    order_number TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending',

    payment_status TEXT NOT NULL DEFAULT 'pending',

    shipping_address JSONB NOT NULL,

    billing_address JSONB,

    subtotal NUMERIC(12,2) NOT NULL
        CHECK (subtotal >= 0),

    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (shipping_fee >= 0),

    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0),

    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (tax_amount >= 0),

    total_amount NUMERIC(12,2) NOT NULL
        CHECK (total_amount >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE RESTRICT,

    CONSTRAINT orders_order_number_unique
        UNIQUE (order_number),

    CONSTRAINT orders_status_check
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded'
            )
        ),

    CONSTRAINT orders_payment_status_check
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded',
                'partially_refunded'
            )
        )
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_orders_user
ON public.orders(user_id);

CREATE INDEX idx_orders_status
ON public.orders(status);

CREATE INDEX idx_orders_payment_status
ON public.orders(payment_status);

CREATE INDEX idx_orders_created_at
ON public.orders(created_at DESC);

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.orders
IS 'Stores customer orders and immutable checkout-level pricing information.';

COMMENT ON COLUMN public.orders.user_id
IS 'User who placed the order.';

COMMENT ON COLUMN public.orders.order_number
IS 'Human-readable unique order identifier shown to customers and administrators.';

COMMENT ON COLUMN public.orders.status
IS 'Current fulfillment lifecycle status of the order.';

COMMENT ON COLUMN public.orders.payment_status
IS 'Current payment state of the order.';

COMMENT ON COLUMN public.orders.shipping_address
IS 'Snapshot of the shipping address captured when the order was placed.';

COMMENT ON COLUMN public.orders.billing_address
IS 'Snapshot of the billing address captured when the order was placed.';

COMMENT ON COLUMN public.orders.subtotal
IS 'Sum of order item subtotals before shipping, discounts and taxes.';

COMMENT ON COLUMN public.orders.shipping_fee
IS 'Shipping cost charged for the order.';

COMMENT ON COLUMN public.orders.discount_amount
IS 'Total discount applied to the order.';

COMMENT ON COLUMN public.orders.tax_amount
IS 'Total tax charged on the order.';

COMMENT ON COLUMN public.orders.total_amount
IS 'Final amount payable for the order.';


-- ============================================
-- Order Items Table
-- ============================================

CREATE TABLE public.order_items (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_variant_id BIGINT NOT NULL,

    product_name TEXT NOT NULL,

    variant_sku TEXT NOT NULL,

    variant_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    subtotal NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES public.orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (product_variant_id)
        REFERENCES public.product_variants(id)
        ON DELETE RESTRICT,

    CONSTRAINT order_items_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT order_items_unit_price_non_negative
        CHECK (unit_price >= 0),

    CONSTRAINT order_items_subtotal_non_negative
        CHECK (subtotal >= 0)
);


-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_order_items_order
ON public.order_items(order_id);

CREATE INDEX idx_order_items_variant
ON public.order_items(product_variant_id);

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_order_items_updated_at
BEFORE UPDATE
ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.order_items
IS 'Stores immutable snapshots of products and variants purchased in an order.';

COMMENT ON COLUMN public.order_items.product_variant_id
IS 'Reference to the product variant that was purchased.';

COMMENT ON COLUMN public.order_items.product_name
IS 'Snapshot of the product name at the time of purchase.';

COMMENT ON COLUMN public.order_items.variant_sku
IS 'Snapshot of the variant SKU at the time of purchase.';

COMMENT ON COLUMN public.order_items.variant_attributes
IS 'Snapshot of selected variant attributes such as Color and Storage at the time of purchase.';

COMMENT ON COLUMN public.order_items.quantity
IS 'Number of units purchased.';

COMMENT ON COLUMN public.order_items.unit_price
IS 'Actual unit price charged to the customer at checkout.';

COMMENT ON COLUMN public.order_items.subtotal
IS 'Quantity multiplied by the unit price charged.';

