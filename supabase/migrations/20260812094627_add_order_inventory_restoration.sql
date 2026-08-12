CREATE TABLE public.order_inventory_restorations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    order_id BIGINT NOT NULL,

    restored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_inventory_restorations_order
        FOREIGN KEY (order_id)
        REFERENCES public.orders(id)
        ON DELETE CASCADE,

    CONSTRAINT order_inventory_restorations_order_unique
        UNIQUE (order_id)
);

CREATE INDEX idx_order_inventory_restorations_order
ON public.order_inventory_restorations(order_id);

COMMENT ON TABLE public.order_inventory_restorations
IS 'Records whether inventory has already been restored for a cancelled order.';