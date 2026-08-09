-- ============================================
-- Users Table
-- ============================================

CREATE TABLE public.users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name TEXT NOT NULL,

    last_name TEXT NOT NULL,

    email TEXT NOT NULL,

    phone TEXT,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'customer',

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_unique
        UNIQUE (email),

    CONSTRAINT users_phone_unique
        UNIQUE (phone),

    CONSTRAINT users_role_check
        CHECK (
            role IN (
                'customer',
                'admin'
            )
        )
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_users_email
ON public.users(email);

CREATE INDEX idx_users_role
ON public.users(role);

CREATE INDEX idx_users_active
ON public.users(is_active);

-- ============================================
-- Trigger
-- ============================================

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE
ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.users
IS 'Stores customer and administrator accounts.';

COMMENT ON COLUMN public.users.password_hash
IS 'BCrypt hashed password.';