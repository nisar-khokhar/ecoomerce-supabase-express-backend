ALTER TABLE public.refunds
ADD COLUMN cancellation_requested BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.refunds.cancellation_requested
IS 'Indicates that the refund was initiated as part of an order cancellation request.';