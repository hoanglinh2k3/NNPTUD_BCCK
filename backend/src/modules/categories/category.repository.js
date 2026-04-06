const { createRequest, sql } = require('../../database/connection');

const CATEGORY_SELECT = `
  SELECT
    c.Id AS id,
    c.Name AS name,
    c.Slug AS slug,
    c.Description AS description,
    c.ParentId AS parentId,
    parent.Name AS parentName,
    c.CreatedAt AS createdAt,
    c.UpdatedAt AS updatedAt
  FROM Category c
  LEFT JOIN Category parent ON parent.Id = c.ParentId
`;

function bindCategoryFilters(request, query = {}) {
  const conditions = ['1 = 1'];

  if (query.parentId) {
    request.input('parentId', sql.Int, Number(query.parentId));
    conditions.push('c.ParentId = @parentId');
  }

  return conditions.join(' AND ');
}

async function findAll(query, pagination) {
  const request = await createRequest();
  const whereClause = bindCategoryFilters(request, query);
  request.input('offset', sql.Int, pagination.offset);
  request.input('limit', sql.Int, pagination.limit);
  const result = await request.query(`
    ${CATEGORY_SELECT}
    WHERE ${whereClause}
    ORDER BY c.Name ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  return result.recordset;
}

async function countAll(query) {
  const request = await createRequest();
  const whereClause = bindCategoryFilters(request, query);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Category c
    WHERE ${whereClause}
  `);
  return result.recordset[0].total;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`${CATEGORY_SELECT} WHERE c.Id = @id`);
  return result.recordset[0] || null;
}

async function findBySlug(slug) {
  const request = await createRequest();
  request.input('slug', sql.NVarChar, slug);
  const result = await request.query(`${CATEGORY_SELECT} WHERE c.Slug = @slug`);
  return result.recordset[0] || null;
}

async function create(payload) {
  const request = await createRequest();
  request.input('name', sql.NVarChar, payload.name);
  request.input('slug', sql.NVarChar, payload.slug);
  request.input('description', sql.NVarChar, payload.description || null);
  request.input('parentId', sql.Int, payload.parentId || null);
  const result = await request.query(`
    INSERT INTO Category (Name, Slug, Description, ParentId)
    OUTPUT INSERTED.Id AS id
    VALUES (@name, @slug, @description, @parentId)
  `);
  return findById(result.recordset[0].id);
}

async function update(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('name', sql.NVarChar, payload.name);
  request.input('slug', sql.NVarChar, payload.slug);
  request.input('description', sql.NVarChar, payload.description || null);
  request.input('parentId', sql.Int, payload.parentId || null);
  await request.query(`
    UPDATE Category
    SET
      Name = @name,
      Slug = @slug,
      Description = @description,
      ParentId = @parentId,
      UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function countChildren(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Category
    WHERE ParentId = @id
  `);
  return result.recordset[0].total;
}

async function countProducts(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Product
    WHERE CategoryId = @id
  `);
  return result.recordset[0].total;
}

async function remove(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM Category WHERE Id = @id');
}

module.exports = {
  findAll,
  countAll,
  findById,
  findBySlug,
  create,
  update,
  countChildren,
  countProducts,
  remove
};
