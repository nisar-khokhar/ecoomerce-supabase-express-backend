-- ============================================
-- Admin Inventory Adjustment
-- ============================================
-- Atomically:
-- 1. Locks the product variant
-- 2. Validates the new quantity
-- 3. Updates inventory
-- 4. Creates inventory movement
--
-- If anything fails, the entire operation rolls back.
-- ============================================

CREATE OR REPLACE FUNCTION public.admin_adjust_inventory(
    p_variant_id BIGINT,
    p_new_quantity INTEGER,
    p_type TEXT,
    p_reason TEXT,
    p_admin_user_id UUID
)
RETURNS public.inventory_movements
LANGUAGE plpgsql
AS $$
DECLARE
    v_variant RECORD;
    v_movement public.inventory_movements;
    v_quantity_change INTEGER;
BEGIN

    -- ==========================================
    -- Validate Quantity
    -- ==========================================

    IF p_new_quantity < 0 THEN
        RAISE EXCEPTION
            'Inventory quantity cannot be negative.';
    END IF;


    -- ==========================================
    -- Validate Movement Type
    -- ==========================================

    IF p_type NOT IN (
        'restock',
        'manual_adjustment'
    ) THEN
        RAISE EXCEPTION
            'Invalid inventory adjustment type.';
    END IF;


    -- ==========================================
    -- Validate Reason
    -- ==========================================

    IF p_reason IS NULL
       OR LENGTH(TRIM(p_reason)) < 3 THEN

        RAISE EXCEPTION
            'A valid reason is required for inventory adjustment.';

    END IF;


    -- ==========================================
    -- Lock Product Variant
    -- ==========================================

    SELECT
        id,
        quantity,
        track_inventory,
        is_active
    INTO v_variant
    FROM public.product_variants
    WHERE id = p_variant_id
    FOR UPDATE;


    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Product variant not found.';
    END IF;


    -- ==========================================
    -- Calculate Change
    -- ==========================================

    v_quantity_change =
        p_new_quantity - v_variant.quantity;


    -- ==========================================
    -- Nothing To Change
    -- ==========================================

    IF v_quantity_change = 0 THEN
        RAISE EXCEPTION
            'New quantity is the same as current quantity.';
    END IF;


    -- ==========================================
    -- Update Inventory
    -- ==========================================

    UPDATE public.product_variants
    SET
        quantity = p_new_quantity,
        updated_at = NOW()
    WHERE id = p_variant_id;


    -- ==========================================
    -- Create Inventory Movement
    -- ==========================================

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
        p_variant_id,
        p_type,
        v_quantity_change,
        v_variant.quantity,
        p_new_quantity,
        TRIM(p_reason),
        'admin',
        NULL,
        p_admin_user_id
    )
    RETURNING *
    INTO v_movement;


    RETURN v_movement;

END;
$$;