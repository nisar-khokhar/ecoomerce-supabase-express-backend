-- ============================================
-- Review Moderation System
-- ============================================

-- ============================================
-- Add Moderation Status
-- ============================================

ALTER TABLE public.product_reviews
ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'published';


-- ============================================
-- Add Moderation Reason
-- ============================================

ALTER TABLE public.product_reviews
ADD COLUMN moderation_reason TEXT;


-- ============================================
-- Admin Who Moderated Review
-- ============================================

ALTER TABLE public.product_reviews
ADD COLUMN moderated_by UUID;


-- ============================================
-- When Review Was Moderated
-- ============================================

ALTER TABLE public.product_reviews
ADD COLUMN moderated_at TIMESTAMPTZ;


-- ============================================
-- Moderation Status Constraint
-- ============================================

ALTER TABLE public.product_reviews
ADD CONSTRAINT product_reviews_moderation_status_check
CHECK (
    moderation_status IN (
        'published',
        'flagged',
        'removed'
    )
);


-- ============================================
-- Admin Relationship
-- ============================================

ALTER TABLE public.product_reviews
ADD CONSTRAINT product_reviews_moderated_by_fk
FOREIGN KEY (moderated_by)
REFERENCES public.users(id)
ON DELETE SET NULL;


-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_product_reviews_moderation_status
ON public.product_reviews(moderation_status);