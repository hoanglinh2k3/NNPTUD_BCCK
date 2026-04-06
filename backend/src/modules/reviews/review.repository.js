const { createRequest, sql } = require('../../database/connection');

async function findByProductId(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      r.Id AS id,
      r.UserId AS userId,
      u.FullName AS fullName,
      u.AvatarUrl AS avatarUrl,
      r.ProductId AS productId,
      r.Rating AS rating,
      r.Comment AS comment,
      r.Status AS status,
      r.CreatedAt AS createdAt,
      r.UpdatedAt AS updatedAt
    FROM Review r
    INNER JOIN [User] u ON u.Id = r.UserId
    WHERE r.ProductId = @productId AND r.Status = 'VISIBLE'
    ORDER BY r.CreatedAt DESC
  `);
  return result.recordset;
}

async function findAllByProductId(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      r.Id AS id,
      r.UserId AS userId,
      u.FullName AS fullName,
      u.AvatarUrl AS avatarUrl,
      r.ProductId AS productId,
      r.Rating AS rating,
      r.Comment AS comment,
      r.Status AS status,
      r.CreatedAt AS createdAt,
      r.UpdatedAt AS updatedAt
    FROM Review r
    INNER JOIN [User] u ON u.Id = r.UserId
    WHERE r.ProductId = @productId
    ORDER BY r.CreatedAt DESC
  `);
  return result.recordset;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      ProductId AS productId,
      Rating AS rating,
      Comment AS comment,
      Status AS status,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
    FROM Review
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function findByUserAndProduct(userId, productId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      ProductId AS productId,
      Rating AS rating,
      Comment AS comment,
      Status AS status
    FROM Review
    WHERE UserId = @userId AND ProductId = @productId
  `);
  return result.recordset[0] || null;
}

async function hasPurchasedProduct(userId, productId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT TOP 1 1 AS purchased
    FROM [Order] o
    INNER JOIN OrderItem oi ON oi.OrderId = o.Id
    WHERE
      o.UserId = @userId
      AND oi.ProductId = @productId
      AND o.Status = 'DELIVERED'
  `);
  return Boolean(result.recordset[0]);
}

async function create(userId, productId, payload) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  request.input('productId', sql.Int, productId);
  request.input('rating', sql.Int, payload.rating);
  request.input('comment', sql.NVarChar, payload.comment || null);
  const result = await request.query(`
    INSERT INTO Review (UserId, ProductId, Rating, Comment)
    OUTPUT INSERTED.Id AS id
    VALUES (@userId, @productId, @rating, @comment)
  `);
  return findById(result.recordset[0].id);
}

async function update(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('rating', sql.Int, payload.rating);
  request.input('comment', sql.NVarChar, payload.comment || null);
  request.input('status', sql.NVarChar, payload.status);
  await request.query(`
    UPDATE Review
    SET
      Rating = @rating,
      Comment = @comment,
      Status = @status,
      UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function remove(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM Review WHERE Id = @id');
}

module.exports = {
  findByProductId,
  findAllByProductId,
  findById,
  findByUserAndProduct,
  hasPurchasedProduct,
  create,
  update,
  remove
};
