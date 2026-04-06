const { createRequest, sql } = require('../../database/connection');

async function findByProductId(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      Id AS id,
      ProductId AS productId,
      ImageUrl AS imageUrl,
      IsPrimary AS isPrimary,
      SortOrder AS sortOrder,
      CreatedAt AS createdAt
    FROM ProductImage
    WHERE ProductId = @productId
    ORDER BY IsPrimary DESC, SortOrder ASC, Id ASC
  `);
  return result.recordset;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT
      Id AS id,
      ProductId AS productId,
      ImageUrl AS imageUrl,
      IsPrimary AS isPrimary,
      SortOrder AS sortOrder,
      CreatedAt AS createdAt
    FROM ProductImage
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function findProductById(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT Id AS id, Name AS name
    FROM Product
    WHERE Id = @productId
  `);
  return result.recordset[0] || null;
}

async function addMany(productId, images) {
  for (const image of images) {
    const request = await createRequest();
    request.input('productId', sql.Int, productId);
    request.input('imageUrl', sql.NVarChar, image.imageUrl);
    request.input('isPrimary', sql.Bit, image.isPrimary ? 1 : 0);
    request.input('sortOrder', sql.Int, image.sortOrder || 0);
    await request.query(`
      INSERT INTO ProductImage (ProductId, ImageUrl, IsPrimary, SortOrder)
      VALUES (@productId, @imageUrl, @isPrimary, @sortOrder)
    `);
  }

  return findByProductId(productId);
}

async function clearPrimary(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  await request.query(`
    UPDATE ProductImage
    SET IsPrimary = 0
    WHERE ProductId = @productId
  `);
}

async function setPrimary(id, productId, isPrimary) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('productId', sql.Int, productId);
  request.input('isPrimary', sql.Bit, isPrimary ? 1 : 0);
  await request.query(`
    UPDATE ProductImage
    SET IsPrimary = @isPrimary
    WHERE Id = @id AND ProductId = @productId
  `);
  return findById(id);
}

async function remove(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM ProductImage WHERE Id = @id');
}

module.exports = {
  findByProductId,
  findById,
  findProductById,
  addMany,
  clearPrimary,
  setPrimary,
  remove
};
