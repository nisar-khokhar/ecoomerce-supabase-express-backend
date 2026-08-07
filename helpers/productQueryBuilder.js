const applyProductFilters = (query, filters) => {
  const { category, brand, search, featured, active } = filters;

  if (category) {
    query = query.eq("category_id", category);
  }

  if (brand) {
    query = query.eq("brand_id", brand);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (featured !== undefined) {
    query = query.eq("is_featured", featured);
  }

  if (active !== undefined) {
    query = query.eq("is_active", active);
  }

  return query;
};

const applySorting = (query, sorting) => {
  const { sort = "created_at", order = "desc" } = sorting;

  return query.order(sort, {
    ascending: order === "asc",
  });
};

const applyPagination = (query, pagination) => {
  const { page = 1, limit = 10 } = pagination;

  const from = (page - 1) * limit;

  const to = from + limit - 1;

  return query.range(from, to);
};

module.exports = {
  applyProductFilters,
  applySorting,
  applyPagination,
};
