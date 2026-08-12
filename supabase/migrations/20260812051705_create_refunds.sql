-- ============================================
-- Refunds Table
-- ============================================

CREATE TABLE public.refunds (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    payment_id BIGINT NOT NULL,

    order_id BIGINT NOT NULL,

    provider TEXT NOT NULL,

    provider_refund_id TEXT,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    currency TEXT NOT NULL DEFAULT 'PKR',

    status TEXT NOT NULL DEFAULT 'pending',

    reason TEXT,

    provider_response JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refunds_payment
        FOREIGN KEY (payment_id)
        REFERENCES public.payments(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_refunds_order
        FOREIGN KEY (order_id)
        REFERENCES public.orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT refunds_status_check
        CHECK (
            status IN (
                'pending',
                'succeeded',
                'failed',
                'cancelled'
            )
        )
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_refunds_payment
ON public.refunds(payment_id);

CREATE INDEX idx_refunds_order
ON public.refunds(order_id);

CREATE INDEX idx_refunds_provider
ON public.refunds(provider);

CREATE INDEX idx_refunds_status
ON public.refunds(status);

CREATE INDEX idx_refunds_created_at
ON public.refunds(created_at DESC);

-- ============================================
-- Provider Refund ID
-- ============================================

CREATE UNIQUE INDEX idx_refunds_provider_refund_id
ON public.refunds(provider, provider_refund_id)
WHERE provider_refund_id IS NOT NULL;

-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_refunds_updated_at
BEFORE UPDATE
ON public.refunds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.refunds
IS 'Stores refund transactions associated with customer payments and orders.';

COMMENT ON COLUMN public.refunds.payment_id
IS 'Reference to the internal payment being refunded.';

COMMENT ON COLUMN public.refunds.order_id
IS 'Reference to the order associated with the refund.';

COMMENT ON COLUMN public.refunds.provider
IS 'Payment provider responsible for processing the refund.';

COMMENT ON COLUMN public.refunds.provider_refund_id
IS 'Refund identifier returned by the external payment provider.';

COMMENT ON COLUMN public.refunds.amount
IS 'Amount refunded in the specified currency.';

COMMENT ON COLUMN public.refunds.status
IS 'Current lifecycle status of the refund.';

COMMENT ON COLUMN public.refunds.reason
IS 'Optional business reason for the refund.';

COMMENT ON COLUMN public.refunds.provider_response
IS 'Raw provider response associated with the refund.';