const { createRequest, sql } = require('../../database/connection');

async function findCartByUserId(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
    FROM Cart
    WHERE UserId = @userId
  `);
  return result.recordset[0] || null;
}

async function createCart(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    INSERT INTO Cart (UserId)
    OUTPUT INSERTED.Id AS id
    VALUES (@userId)
  `);
  return findCartByUserId(userId) || result.recordset[0];
}

async function findCartItems(cartId) {
  const request = await createRequest();
  request.input('cartId', sql.Int, cartId);
  const result = await request.query(`
    SELECT
      ci.Id AS id,
      ci.CartId AS cartId,
      ci.ProductId AS productId,
      p.Name AS productName,
      p.SKU AS sku,
      p.Price AS price,
      p.DiscountPrice AS discountPrice,
      ci.Quantity AS quantity,
      ci.UnitPrice AS unitPrice,
      ci.Quantity * ci.UnitPrice AS subTotal,
      image.ImageUrl AS imageUrl,
      ISNULL(inv.Quantity, 0) AS inventoryQuantity,
      p.Status AS status,
      ci.CreatedAt AS createdAt,
      ci.UpdatedAt AS updatedAt
    FROM CartItem ci
    INNER JOIN Product p ON p.Id = ci.ProductId
    LEFT JOIN ProductImage image ON image.ProductId = p.Id AND image.IsPrimary = 1
    LEFT JOIN Inventory inv ON inv.ProductId = p.Id
    WHERE ci.CartId = @cartId
    ORDER BY ci.CreatedAt DESC
  `);
  return result.recordset;
}

async function findItemById(itemId, cartId) {
  const request = await createRequest();
  request.input('itemId', sql.Int, itemId);
  request.input('cartId', sql.Int, cartId);
  const result = await request.query(`
    SELECT
      Id AS id,
      CartId AS cartId,
      ProductId AS productId,
      Quantity AS quantity,
      UnitPrice AS unitPrice
    FROM CartItem
    WHERE Id = @itemId AND CartId = @cartId
  `);
  return result.recordset[0] || null;
}

async function findItemByCartAndProduct(cartId, productId) {
  const request = await createRequest();
  request.input('cartId', sql.Int, cartId);
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      Id AS id,
      CartId AS cartId,
      ProductId AS productId,
      Quantity AS quantity,
      UnitPrice AS unitPrice
    FROM CartItem
    WHERE CartId = @cartId AND ProductId = @productId
  `);
  return result.recordset[0] || null;
}

async function findProductForCart(productId) {
  const request = await createRequest();
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      p.Id AS id,
      p.Name AS name,
      p.Price AS price,
      p.DiscountPrice AS discountPrice,
      p.Status AS status,
      ISNULL(inv.Quantity, 0) AS inventoryQuantity
    FROM Product p
    LEFT JOIN Inventory inv ON inv.ProductId = p.Id
    WHERE p.Id = @productId
  `);
  return result.recordset[0] || null;
}

async function insertItem(cartId, productId, quantity, unitPrice) {
  const request = await createRequest();
  request.input('cartId', sql.Int, cartId);
  request.input('productId', sql.Int, productId);
  request.input('quantity', sql.Int, quantity);
  request.input('unitPrice', sql.Decimal(18, 2), unitPrice);
  await request.query(`
    INSERT INTO CartItem (CartId, ProductId, Quantity, UnitPrice)
    VALUES (@cartId, @productId, @quantity, @unitPrice)
  `);
}

async function updateItem(itemId, quantity, unitPrice) {
  const request = await createRequest();
  request.input('itemId', sql.Int, itemId);
  request.input('quantity', sql.Int, quantity);
  request.input('unitPrice', sql.Decimal(18, 2), unitPrice);
  await request.query(`
    UPDATE CartItem
    SET Quantity = @quantity, UnitPrice = @unitPrice, UpdatedAt = GETDATE()
    WHERE Id = @itemId
  `);
}

async function deleteItem(itemId) {
  const request = await createRequest();
  request.input('itemId', sql.Int, itemId);
  await request.query('DELETE FROM CartItem WHERE Id = @itemId');
}

async function clearItems(cartId) {
  const request = await createRequest();
  request.input('cartId', sql.Int, cartId);
  await request.query('DELETE FROM CartItem WHERE CartId = @cartId');
}

module.exports = {
  findCartByUserId,
  createCart,
  findCartItems,
  findItemById,
  findItemByCartAndProduct,
  findProductForCart,
  insertItem,
  updateItem,
  deleteItem,
  clearItems
};
