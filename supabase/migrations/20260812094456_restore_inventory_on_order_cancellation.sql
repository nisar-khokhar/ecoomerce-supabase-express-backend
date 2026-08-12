-- ============================================
-- Restore Inventory After Order Cancellation
-- ============================================

CREATE OR REPLACE FUNCTION public.restore_cancelled_order_inventory(
    p_order_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_variant RECORD;
BEGIN

    -- ==========================================
    -- Lock Order
    -- ==========================================

    SELECT *
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found.';
    END IF;


    -- ==========================================
    -- Order Must Be Cancelled
    -- ==========================================

    IF v_order.status <> 'cancelled' THEN
        RAISE EXCEPTION
            'Only cancelled orders can restore inventory.';
    END IF;


    -- ==========================================
    -- Process Order Items
    -- ==========================================

    FOR v_item IN
        SELECT
            id,
            product_variant_id,
            quantity
        FROM public.order_items
        WHERE order_id = p_order_id
        ORDER BY id
    LOOP

        -- ========================================
        -- Lock Variant
        -- ========================================

        SELECT *
        INTO v_variant
        FROM public.product_variants
        WHERE id = v_item.product_variant_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Product variant % not found.',
                v_item.product_variant_id;
        END IF;


        -- ========================================
        -- Restore Inventory
        -- ========================================

        IF v_variant.track_inventory = TRUE THEN

            UPDATE public.product_variants
            SET
                quantity = quantity + v_item.quantity,
                updated_at = NOW()
            WHERE id = v_variant.id;

        END IF;

    END LOOP;

END;
$$;

COMMENT ON FUNCTION public.restore_cancelled_order_inventory(BIGINT)
IS 'Restores inventory for all tracked product variants belonging to a cancelled order.';