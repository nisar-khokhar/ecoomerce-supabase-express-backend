/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const formatCart = (cart) => {
  if (!cart) {
    return null;
  }

  let totalItems = 0;
  let subtotal = 0;

  const items = (cart.cart_items || []).map((item) => {
    const variant = item.product_variants;

    const itemSubtotal = Number(variant.price) * item.quantity;

    totalItems += item.quantity;
    subtotal += itemSubtotal;

    const attributes = {};

    for (const mapping of variant.product_variant_values || []) {
      const value = mapping.variant_values;

      if (!value) continue;

      const type = value.variant_types;

      if (!type) continue;

      attributes[type.name] = value.label;
    }

    const primaryImage =
      variant.products?.product_images?.find((image) => image.is_primary) ||
      variant.products?.product_images?.[0] ||
      null;

    return {
      id: item.id,
      product_variant_id: variant.id,
      quantity: item.quantity,
      unit_price: Number(variant.price),
      subtotal: itemSubtotal,

      product: {
        id: variant.products?.id,
        name: variant.products?.name,
        slug: variant.products?.slug,
        image: primaryImage?.image_path || null,
      },

      variant: {
        sku: variant.sku,
        barcode: variant.barcode,
        price: Number(variant.price),
        compare_price:
          variant.compare_price !== null ? Number(variant.compare_price) : null,
        weight: variant.weight !== null ? Number(variant.weight) : null,
        available_quantity: variant.quantity,
        track_inventory: variant.track_inventory,
        is_active: variant.is_active,
        attributes,
      },
    };
  });

  return {
    id: cart.id,
    user_id: cart.user_id,
    items,
    total_items: totalItems,
    subtotal,
    created_at: cart.created_at,
    updated_at: cart.updated_at,
  };
};

module.exports = {
  formatCart,
};
