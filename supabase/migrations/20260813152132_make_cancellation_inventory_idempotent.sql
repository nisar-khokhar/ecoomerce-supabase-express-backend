-- ============================================
-- Make Cancellation Inventory Restoration
-- Idempotent
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
    -- Idempotency
    -- ==========================================
    --
    -- If this order already has a cancellation
    -- movement, the inventory restoration was
    -- already completed.
    --
    -- Because the entire function is transactional,
    -- a cancellation movement can only exist after
    -- the corresponding inventory restoration
    -- succeeded.
    -- ==========================================

    IF EXISTS (
        SELECT 1
        FROM public.inventory_movements
        WHERE type = 'cancellation'
          AND reference_type = 'order'
          AND reference_id = p_order_id
    ) THEN

        RETURN;

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

        -- ======================================
        -- Lock Variant
        -- ======================================

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


        -- ======================================
        -- Restore Inventory
        -- ======================================

        IF v_variant.track_inventory = TRUE THEN

            UPDATE public.product_variants
            SET
                quantity =
                    quantity + v_item.quantity,
                updated_at = NOW()
            WHERE id = v_variant.id;


            -- ==================================
            -- Record Cancellation Movement
            -- ==================================

            INSERT INTO public.inventory_movements (
                product_variant_id,
                type,
                quantity,
                previous_quantity,
                new_quantity,
                reason,
                reference_type,
                reference_id,
                created_by
            )
            VALUES (
                v_variant.id,
                'cancellation',
                v_item.quantity,
                v_variant.quantity,
                v_variant.quantity + v_item.quantity,
                'Inventory restored after order cancellation.',
                'order',
                p_order_id,
                NULL
            );

        END IF;

    END LOOP;

END;
$$;


COMMENT ON FUNCTION public.restore_cancelled_order_inventory(BIGINT)
IS
'Idempotently restores inventory for tracked product variants belonging to a cancelled order and records cancellation inventory movements.';