const supabase = require("../config/supabase");

// ============================================
// Verify User Purchased Product
// ============================================

const verifyUserPurchasedProduct = async (userId, productId) => {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
        id,

        orders!inner (
          id,
          user_id,
          status
        ),

        product_variants!inner (
          id,
          product_id
        )
      `,
    )
    .eq("orders.user_id", userId)
    .eq("orders.status", "delivered")
    .eq("product_variants.product_id", productId)
    .limit(1);

  if (error) {
    console.error("VERIFY PURCHASE ERROR:", error);

    throw new Error("Unable to verify product purchase.");
  }

  return data && data.length > 0;
};

// ============================================
// Create Review
// ============================================

const createReview = async ({ userId, productId, rating, title, review }) => {
  // ==========================================
  // Verify Product Exists
  // ==========================================

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error("Unable to fetch product.");
  }

  if (!product) {
    throw new Error("Product not found.");
  }

  // ==========================================
  // Verify User Purchased Product
  // ==========================================

  const hasPurchased = await verifyUserPurchasedProduct(userId, productId);

  if (!hasPurchased) {
    throw new Error(
      "You can only review products you have purchased and received.",
    );
  }

  // ==========================================
  // Check Existing Review
  // ==========================================

  const { data: existingReview, error: existingError } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error("Unable to check existing review.");
  }

  if (existingReview) {
    throw new Error("You have already reviewed this product.");
  }

  // ==========================================
  // Create Review
  // ==========================================

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: productId,
      user_id: userId,
      rating,
      title: title || null,
      review: review || null,

      is_verified_purchase: true,

      // Reviews are published by default.
      // Moderation is for policy violations,
      // not for controlling positive/negative
      // opinions.
      moderation_status: "published",
    })
    .select(
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
        updated_at
      `,
    )
    .single();

  if (error) {
    console.error("CREATE REVIEW ERROR:", error);

    throw new Error("Unable to create review.");
  }

  return data;
};

// ============================================
// Get Product Reviews
// ============================================

const getProductReviews = async (
  productId,
  { page = 1, limit = 10, rating } = {},
) => {
  // ==========================================
  // Verify Product Exists
  // ==========================================

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    throw new Error("Unable to fetch product.");
  }

  if (!product) {
    throw new Error("Product not found.");
  }

  // ==========================================
  // Pagination
  // ==========================================

  const offset = (page - 1) * limit;

  // ==========================================
  // Fetch Published Reviews
  // ==========================================

  let query = supabase
    .from("product_reviews")
    .select(
      `
        id,
        product_id,
        user_id,
        rating,
        title,
        review,
        is_verified_purchase,

        moderation_status,

        created_at,
        updated_at,

        users!product_reviews_user_fk (
          first_name,
          last_name
        )
      `,
      { count: "exact" },
    )
    .eq("product_id", productId)

    // Only published reviews are visible
    // to customers.
    .in("moderation_status", ["published", "flagged"]);

  // ==========================================
  // Rating Filter
  // ==========================================

  if (rating !== undefined) {
    query = query.eq("rating", rating);
  }

  // ==========================================
  // Pagination + Sorting
  // ==========================================

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  const { data: reviews, error: reviewError, count } = await query;

  if (reviewError) {
    console.error("GET PRODUCT REVIEWS ERROR:", reviewError);

    throw new Error("Unable to fetch product reviews.");
  }

  // ==========================================
  // Rating Statistics
  // ==========================================

  const { data: allReviews, error: statsError } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .in("moderation_status", ["published", "flagged"]);

  if (statsError) {
    console.error("RATING STATISTICS ERROR:", statsError);

    throw new Error("Unable to calculate rating statistics.");
  }

  // ==========================================
  // Calculate Rating Summary
  // ==========================================

  const totalReviews = allReviews.length;

  const ratingTotal = allReviews.reduce((sum, item) => sum + item.rating, 0);

  const averageRating =
    totalReviews > 0 ? Number((ratingTotal / totalReviews).toFixed(2)) : 0;

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  for (const item of allReviews) {
    ratingDistribution[item.rating]++;
  }

  // ==========================================
  // Return Result
  // ==========================================

  const totalPages = Math.ceil(count / limit);

  return {
    reviews,

    summary: {
      average_rating: averageRating,
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution,
    },

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
// Update Review
// ============================================

const updateReview = async ({ userId, reviewId, rating, title, review }) => {
  // ==========================================
  // Find Review Owned By User
  // ==========================================

  const { data: existingReview, error: fetchError } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch review.");
  }

  if (!existingReview) {
    throw new Error("Review not found or you are not authorized to modify it.");
  }

  // ==========================================
  // Update Review
  // ==========================================

  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      rating: rating !== undefined ? rating : existingReview.rating,

      title: title !== undefined ? title : existingReview.title,

      review: review !== undefined ? review : existingReview.review,

      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select(
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
        updated_at
      `,
    )
    .single();

  if (error) {
    console.error("UPDATE REVIEW ERROR:", error);

    throw new Error("Unable to update review.");
  }

  return data;
};

// ============================================
// Delete Review
// ============================================

const deleteReview = async ({ userId, reviewId }) => {
  // ==========================================
  // Verify Ownership
  // ==========================================

  const { data: existingReview, error: fetchError } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch review.");
  }

  if (!existingReview) {
    throw new Error("Review not found or you are not authorized to delete it.");
  }

  // ==========================================
  // Delete Review
  // ==========================================

  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) {
    console.error("DELETE REVIEW ERROR:", error);

    throw new Error("Unable to delete review.");
  }

  return {
    id: reviewId,
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  verifyUserPurchasedProduct,
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
};
