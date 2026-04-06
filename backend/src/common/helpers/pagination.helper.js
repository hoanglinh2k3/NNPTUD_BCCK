function normalizePagination(query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.max(Math.min(Number(query.limit || 10), 100), 1);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  };
}

module.exports = {
  normalizePagination,
  buildMeta
};
