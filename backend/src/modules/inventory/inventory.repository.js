const { createRequest, sql } = require('../../database/connection');

function bindInventoryFilters(request, query = {}) {
  const conditions = ['1 = 1'];

  if (query.keyword) {
    request.input('keyword', sql.NVarChar, `%${query.keyword}%`);
    conditions.push('(p.Name LIKE @keyword OR p.SKU LIKE @keyword)');
  }

  if (query.lowStock) {
    request.input('lowStock', sql.Int, Number(query.lowStock));
    conditions.push('i.Quantity <= @lowStock');
  }

  return conditions.join(' AND ');
}

async function findAll(query, pagination) {
  const request = await createRequest();
  const whereClause = bindInventoryFilters(request, query);
  request.input('offset', sql.Int, pagination.offset);
  request.input('limit', sql.Int, pagination.limit);
  const result = await request.query(`
    SELECT
      i.Id AS id,
      i.ProductId AS productId,
      p.Name AS productName,
      p.SKU AS sku,
      i.Quantity AS quantity,
      i.ReservedQuantity AS reservedQuantity,
      i.SoldQuantity AS soldQuantity,
      i.UpdatedAt AS updatedAt
    FROM Inventory i
    INNER JOIN Product p ON p.Id = i.ProductId
    WHERE ${whereClause}
    ORDER BY i.UpdatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  return result.recordset;
}

async function countAll(query) {
  const request = await createRequest();
  const whereClause = bindInventoryFilters(request, query);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Inventory i
    INNER JOIN Product p ON p.Id = i.ProductId
    WHERE ${whereClause}
  `);
  return result.recordset[0].total;
}

async function findByProductId(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      i.Id AS id,
      i.ProductId AS productId,
      p.Name AS productName,
      p.SKU AS sku,
      i.Quantity AS quantity,
      i.ReservedQuantity AS reservedQuantity,
      i.SoldQuantity AS soldQuantity,
      i.UpdatedAt AS updatedAt
    FROM Inventory i
    INNER JOIN Product p ON p.Id = i.ProductId
    WHERE i.ProductId = @productId
  `);
  return result.recordset[0] || null;
}

async function updateQuantity(productId, quantity) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  request.input('quantity', sql.Int, quantity);
  await request.query(`
    UPDATE Inventory
    SET Quantity = @quantity, UpdatedAt = GETDATE()
    WHERE ProductId = @productId
  `);
  return findByProductId(productId);
}

async function updateReserve(productId, reservedQuantity, quantity) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  request.input('reservedQuantity', sql.Int, reservedQuantity);
  request.input('quantity', sql.Int, quantity);
  await request.query(`
    UPDATE Inventory
    SET ReservedQuantity = @reservedQuantity, Quantity = @quantity, UpdatedAt = GETDATE()
    WHERE ProductId = @productId
  `);
  return findByProductId(productId);
}

async function updateSold(productId, quantity, reservedQuantity, soldQuantity) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  request.input('quantity', sql.Int, quantity);
  request.input('reservedQuantity', sql.Int, reservedQuantity);
  request.input('soldQuantity', sql.Int, soldQuantity);
  await request.query(`
    UPDATE Inventory
    SET
      Quantity = @quantity,
      ReservedQuantity = @reservedQuantity,
      SoldQuantity = @soldQuantity,
      UpdatedAt = GETDATE()
    WHERE ProductId = @productId
  `);
  return findByProductId(productId);
}

module.exports = {
  findAll,
  countAll,
  findByProductId,
  updateQuantity,
  updateReserve,
  updateSold
};
