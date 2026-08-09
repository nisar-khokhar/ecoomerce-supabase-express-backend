-- ============================================
-- User Addresses Table
-- ============================================

CREATE TABLE public.user_addresses (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL,

    label TEXT NOT NULL,

    recipient_name TEXT NOT NULL,

    phone TEXT NOT NULL,

    address_line_1 TEXT NOT NULL,

    address_line_2 TEXT,

    city TEXT NOT NULL,

    province TEXT NOT NULL,

    postal_code TEXT,

    country_code CHAR(2) NOT NULL,

    delivery_notes TEXT,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_user_addresses_user
ON public.user_addresses(user_id);

CREATE INDEX idx_user_addresses_city
ON public.user_addresses(city);

CREATE INDEX idx_user_addresses_country
ON public.user_addresses(country_code);

CREATE UNIQUE INDEX idx_user_addresses_default
ON public.user_addresses(user_id)
WHERE is_default = TRUE;

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_user_addresses_updated_at
BEFORE UPDATE
ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_addresses
IS 'Stores shipping addresses for users.';

COMMENT ON COLUMN public.user_addresses.label
IS 'User-friendly label such as Home, Office or Parents.';

COMMENT ON COLUMN public.user_addresses.is_default
IS 'Indicates the default shipping address for the user.';

