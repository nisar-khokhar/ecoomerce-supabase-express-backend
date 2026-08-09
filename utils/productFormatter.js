const formatProduct = (product) => {
  const { product_variants, ...productData } = product;

  return {
    ...productData,

    variants: (product_variants || []).map((variant) => {
      const { product_variant_values, ...variantData } = variant;

      return {
        ...variantData,

        variant_values: (product_variant_values || []).map((mapping) => ({
          id: mapping.variant_values.id,
          code: mapping.variant_values.value_code,
          label: mapping.variant_values.label,

          type: {
            id: mapping.variant_values.variant_types.id,
            name: mapping.variant_values.variant_types.name,
          },
        })),
      };
    }),
  };
};

module.exports = {
  formatProduct,
};
