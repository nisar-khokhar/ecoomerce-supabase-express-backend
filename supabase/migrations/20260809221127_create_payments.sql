-- ============================================
-- Payments Table
-- ============================================

CREATE TABLE public.payments (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    order_id BIGINT NOT NULL,

    provider TEXT NOT NULL,

    provider_payment_id TEXT,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    currency CHAR(3) NOT NULL DEFAULT 'PKR',

    status TEXT NOT NULL DEFAULT 'pending',

    provider_response JSONB,

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES public.orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT payments_provider_check
        CHECK (
            provider IN (
                'xpay',
                'stripe'
            )
        ),

    CONSTRAINT payments_status_check
        CHECK (
            status IN (
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled',
                'refunded',
                'partially_refunded'
            )
        )
);


-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_payments_order
ON public.payments(order_id);

CREATE INDEX idx_payments_provider
ON public.payments(provider);

CREATE INDEX idx_payments_status
ON public.payments(status);

CREATE INDEX idx_payments_provider_payment
ON public.payments(provider, provider_payment_id);


-- ============================================
-- Updated At Trigger
-- ============================================

CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE
ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.payments
IS 'Stores payment attempts and payment lifecycle information for orders.';

COMMENT ON COLUMN public.payments.order_id
IS 'Order associated with the payment.';

COMMENT ON COLUMN public.payments.provider
IS 'Payment gateway used to process the payment, such as XPay or Stripe.';

COMMENT ON COLUMN public.payments.provider_payment_id
IS 'Payment transaction identifier returned by the payment provider.';

COMMENT ON COLUMN public.payments.amount
IS 'Amount processed for this payment attempt.';

COMMENT ON COLUMN public.payments.currency
IS 'Three-letter ISO 4217 currency code.';

COMMENT ON COLUMN public.payments.status
IS 'Current lifecycle status of the payment.';

COMMENT ON COLUMN public.payments.provider_response
IS 'Raw or relevant provider response data retained for debugging and reconciliation.';

COMMENT ON COLUMN public.payments.paid_at
IS 'Timestamp when the payment was successfully completed.';