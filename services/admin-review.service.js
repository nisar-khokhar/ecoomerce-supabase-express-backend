/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

// ============================================
// Get All Reviews - Admin
// ============================================

const getAllReviews = async ({
  page = 1,
  limit = 20,
  moderation_status,
  rating,
}) => {
  const offset = (page - 1) * limit;

  let query = supabase.from("product_reviews").select(
    `
        id,
        product_id,
        user_id,
        rating,
        title,
        review,
        is_verified_purchase,

        moderation_status,
        moderation_reason,
        moderated_by,
        moderated_at,

        created_at,
        updated_at,

        products (
          id,
          name,
          slug
        ),

        users!product_reviews_user_fk (
          id,
          first_name,
          last_name,
          email
        )
      `,
    { count: "exact" },
  );

  // ==========================================
  // Filter By Moderation Status
  // ==========================================

  if (moderation_status !== undefined) {
    query = query.eq("moderation_status", moderation_status);
  }

  // ==========================================
  // Filter By Rating
  // ==========================================

  if (rating !== undefined) {
    query = query.eq("rating", rating);
  }

  // ==========================================
  // Pagination
  // ==========================================

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("ADMIN GET REVIEWS ERROR:", error);

    throw new Error("Unable to fetch reviews.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    reviews: data,

    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// ============================================
// Flag Review
// ============================================

const flagReview = async ({ reviewId, adminUserId, reason }) => {
  const { data: review, error: fetchError } = await supabase
    .from("product_reviews")
    .select("id, moderation_status")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch review.");
  }

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.moderation_status === "flagged") {
    throw new Error("Review is already flagged.");
  }

  if (review.moderation_status === "removed") {
    throw new Error("Removed reviews cannot be flagged.");
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      moderation_status: "flagged",
      moderation_reason: reason,
      moderated_by: adminUserId,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to flag review.");
  }

  return data;
};

// ============================================
// Remove Review
// ============================================

const removeReview = async ({ reviewId, adminUserId, reason }) => {
  const { data: review, error: fetchError } = await supabase
    .from("product_reviews")
    .select("id, moderation_status")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch review.");
  }

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.moderation_status === "removed") {
    throw new Error("Review is already removed.");
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      moderation_status: "removed",
      moderation_reason: reason,
      moderated_by: adminUserId,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to remove review.");
  }

  return data;
};

// ============================================
// Restore Review
// ============================================

const restoreReview = async ({ reviewId, adminUserId }) => {
  const { data: review, error: fetchError } = await supabase
    .from("product_reviews")
    .select("id, moderation_status")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch review.");
  }

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.moderation_status === "published") {
    throw new Error("Review is already published.");
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      moderation_status: "published",
      moderation_reason: null,
      moderated_by: adminUserId,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to restore review.");
  }

  return data;
};

module.exports = {
  getAllReviews,
  flagReview,
  removeReview,
  restoreReview,
};
