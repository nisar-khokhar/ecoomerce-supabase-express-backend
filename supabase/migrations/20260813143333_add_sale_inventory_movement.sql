-- ============================================
-- Add Sale Inventory Movement
-- ============================================
--
-- Updates the existing paid-order fulfillment
-- function so every successful inventory
-- deduction creates an inventory movement.
--
-- IMPORTANT:
-- Do not modify the old migration.
-- This migration replaces the function using
-- CREATE OR REPLACE.
-- ============================================


CREATE OR REPLACE FUNCTION public.fulfill_paid_order(
    p_order_id BIGINT,
    p_payment_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment RECORD;
    v_order RECORD;
    v_item RECORD;
    v_variant RECORD;
    v_cart RECORD;
BEGIN

    -- ==========================================
    -- Lock Payment
    -- ==========================================

    SELECT *
    INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found.';
    END IF;


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
    -- Verify Payment Belongs To Order
    -- ==========================================

    IF v_payment.order_id <> v_order.id THEN
        RAISE EXCEPTION
            'Payment does not belong to this order.';
    END IF;


    -- ==========================================
    -- Idempotency
    -- ==========================================

    IF v_order.status = 'confirmed'
       AND v_order.payment_status = 'paid' THEN

        RETURN;

    END IF;


    -- ==========================================
    -- Payment Must Be Paid
    -- ==========================================

    IF v_payment.status <> 'paid' THEN
        RAISE EXCEPTION
            'Payment is not marked as paid.';
    END IF;


    -- ==========================================
    -- Process Every Order Item
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
        -- Lock Product Variant
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
        -- Check Inventory
        -- ======================================

        IF v_variant.track_inventory = TRUE THEN

            IF v_variant.quantity < v_item.quantity THEN

                RAISE EXCEPTION
                    'Insufficient inventory for variant %. Available: %, Required: %.',
                    v_variant.id,
                    v_variant.quantity,
                    v_item.quantity;

            END IF;


            -- ==================================
            -- Store Previous Quantity
            -- ==================================

            -- v_variant.quantity represents the
            -- quantity before the deduction.


            -- ==================================
            -- Deduct Inventory
            -- ==================================

            UPDATE public.product_variants
            SET
                quantity = quantity - v_item.quantity,
                updated_at = NOW()
            WHERE id = v_variant.id;


            -- ==================================
            -- Record Sale Movement
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
                'sale',
                -v_item.quantity,
                v_variant.quantity,
                v_variant.quantity - v_item.quantity,
                'Inventory deducted for paid order.',
                'order',
                p_order_id,
                NULL
            );

        END IF;

    END LOOP;


    -- ==========================================
    -- Mark Payment As Paid
    -- ==========================================

    UPDATE public.payments
    SET
        status = 'paid',
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
    WHERE id = p_payment_id;


    -- ==========================================
    -- Mark Order As Paid And Confirmed
    -- ==========================================

    UPDATE public.orders
    SET
        payment_status = 'paid',
        status = 'confirmed',
        updated_at = NOW()
    WHERE id = p_order_id;


    -- ==========================================
    -- Reduce / Remove Purchased Cart Quantities
    -- ==========================================

    SELECT id
    INTO v_cart
    FROM public.carts
    WHERE user_id = v_order.user_id
    FOR UPDATE;

    IF FOUND THEN

        FOR v_item IN
            SELECT
                ci.id,
                ci.quantity,
                oi.quantity AS ordered_quantity
            FROM public.cart_items ci
            INNER JOIN public.order_items oi
                ON oi.product_variant_id =
                   ci.product_variant_id
            WHERE ci.cart_id = v_cart.id
              AND oi.order_id = p_order_id
        LOOP

            IF v_item.quantity > v_item.ordered_quantity THEN

                UPDATE public.cart_items
                SET
                    quantity =
                        quantity -
                        v_item.ordered_quantity,
                    updated_at = NOW()
                WHERE id = v_item.id;

            ELSE

                DELETE FROM public.cart_items
                WHERE id = v_item.id;

            END IF;

        END LOOP;

    END IF;

END;
$$;


COMMENT ON FUNCTION public.fulfill_paid_order(BIGINT, BIGINT)
IS
'Atomically fulfills a successfully paid order by deducting inventory, recording sale inventory movements, updating payment/order status and reducing purchased cart quantities.';