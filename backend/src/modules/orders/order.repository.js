const { createRequest, sql } = require('../../database/connection');

const ORDER_SELECT = `
  SELECT
    o.Id AS id,
    o.UserId AS userId,
    u.FullName AS customerName,
    u.Email AS customerEmail,
    u.Phone AS customerPhone,
    o.AddressId AS addressId,
    a.ReceiverName AS receiverName,
    a.Phone AS receiverPhone,
    a.Province AS province,
    a.District AS district,
    a.Ward AS ward,
    a.DetailAddress AS detailAddress,
    o.OrderCode AS orderCode,
    o.TotalAmount AS totalAmount,
    o.Status AS status,
    o.PaymentStatus AS paymentStatus,
    o.Note AS note,
    o.CreatedAt AS createdAt,
    o.UpdatedAt AS updatedAt
  FROM [Order] o
  INNER JOIN [User] u ON u.Id = o.UserId
  INNER JOIN Address a ON a.Id = o.AddressId
`;

function getRequest(transaction = null) {
  return transaction ? Promise.resolve(transaction.request()) : createRequest();
}

function bindOrderFilters(request, query = {}, currentUser) {
  const conditions = ['1 = 1'];

  if (currentUser.role === 'Customer') {
    request.input('userId', sql.Int, currentUser.id);
    conditions.push('o.UserId = @userId');
  }

  if (query.status) {
    request.input('status', sql.NVarChar, query.status);
    conditions.push('o.Status = @status');
  }

  if (query.paymentStatus) {
    request.input('paymentStatus', sql.NVarChar, query.paymentStatus);
    conditions.push('o.PaymentStatus = @paymentStatus');
  }

  if (query.keyword) {
    request.input('keyword', sql.NVarChar, `%${query.keyword}%`);
    conditions.push('(o.OrderCode LIKE @keyword OR u.FullName LIKE @keyword OR u.Email LIKE @keyword)');
  }

  return conditions.join(' AND ');
}

async function findCartByUserId(userId, transaction = null) {
  const request = await getRequest(transaction);
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

async function findCartItemsByCartId(cartId, transaction = null) {
  const request = await getRequest(transaction);
  request.input('cartId', sql.Int, cartId);
  const result = await request.query(`
    SELECT
      ci.Id AS id,
      ci.ProductId AS productId,
      p.Name AS productName,
      ci.Quantity AS quantity,
      ci.UnitPrice AS unitPrice,
      (ci.Quantity * ci.UnitPrice) AS subTotal
    FROM CartItem ci
    INNER JOIN Product p ON p.Id = ci.ProductId
    WHERE ci.CartId = @cartId
    ORDER BY ci.Id ASC
  `);
  return result.recordset;
}

async function findAddressByIdAndUser(addressId, userId, transaction = null) {
  const request = await getRequest(transaction);
  request.input('addressId', sql.Int, addressId);
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      ReceiverName AS receiverName,
      Phone AS phone,
      Province AS province,
      District AS district,
      Ward AS ward,
      DetailAddress AS detailAddress,
      IsDefault AS isDefault
    FROM Address
    WHERE Id = @addressId AND UserId = @userId
  `);
  return result.recordset[0] || null;
}

async function lockInventoryByProductId(productId, transaction) {
  const request = await getRequest(transaction);
  request.input('productId', sql.Int, productId);
  const result = await request.query(`
    SELECT
      Id AS id,
      ProductId AS productId,
      Quantity AS quantity,
      ReservedQuantity AS reservedQuantity,
      SoldQuantity AS soldQuantity
    FROM Inventory WITH (UPDLOCK, ROWLOCK)
    WHERE ProductId = @productId
  `);
  return result.recordset[0] || null;
}

async function createOrder(transaction, payload) {
  const request = await getRequest(transaction);
  request.input('userId', sql.Int, payload.userId);
  request.input('addressId', sql.Int, payload.addressId);
  request.input('orderCode', sql.NVarChar, payload.orderCode);
  request.input('totalAmount', sql.Decimal(18, 2), payload.totalAmount);
  request.input('status', sql.NVarChar, payload.status);
  request.input('paymentStatus', sql.NVarChar, payload.paymentStatus);
  request.input('note', sql.NVarChar, payload.note || null);
  const result = await request.query(`
    INSERT INTO [Order] (
      UserId,
      AddressId,
      OrderCode,
      TotalAmount,
      Status,
      PaymentStatus,
      Note
    )
    OUTPUT INSERTED.Id AS id
    VALUES (
      @userId,
      @addressId,
      @orderCode,
      @totalAmount,
      @status,
      @paymentStatus,
      @note
    )
  `);
  return result.recordset[0];
}

async function createOrderItem(transaction, payload) {
  const request = await getRequest(transaction);
  request.input('orderId', sql.Int, payload.orderId);
  request.input('productId', sql.Int, payload.productId);
  request.input('productName', sql.NVarChar, payload.productName);
  request.input('quantity', sql.Int, payload.quantity);
  request.input('unitPrice', sql.Decimal(18, 2), payload.unitPrice);
  request.input('subTotal', sql.Decimal(18, 2), payload.subTotal);
  await request.query(`
    INSERT INTO OrderItem (OrderId, ProductId, ProductName, Quantity, UnitPrice, SubTotal)
    VALUES (@orderId, @productId, @productName, @quantity, @unitPrice, @subTotal)
  `);
}

async function createPayment(transaction, payload) {
  const request = await getRequest(transaction);
  request.input('orderId', sql.Int, payload.orderId);
  request.input('method', sql.NVarChar, payload.method);
  request.input('amount', sql.Decimal(18, 2), payload.amount);
  request.input('status', sql.NVarChar, payload.status);
  const result = await request.query(`
    INSERT INTO Payment (OrderId, Method, Amount, Status)
    OUTPUT INSERTED.Id AS id
    VALUES (@orderId, @method, @amount, @status)
  `);
  return result.recordset[0];
}

async function updateInventoryAfterCheckout(transaction, productId, nextQuantity, nextSoldQuantity) {
  const request = await getRequest(transaction);
  request.input('productId', sql.Int, productId);
  request.input('nextQuantity', sql.Int, nextQuantity);
  request.input('nextSoldQuantity', sql.Int, nextSoldQuantity);
  await request.query(`
    UPDATE Inventory
    SET
      Quantity = @nextQuantity,
      SoldQuantity = @nextSoldQuantity,
      UpdatedAt = GETDATE()
    WHERE ProductId = @productId
  `);
}

async function restoreInventory(transaction, productId, nextQuantity, nextSoldQuantity) {
  const request = await getRequest(transaction);
  request.input('productId', sql.Int, productId);
  request.input('nextQuantity', sql.Int, nextQuantity);
  request.input('nextSoldQuantity', sql.Int, nextSoldQuantity);
  await request.query(`
    UPDATE Inventory
    SET
      Quantity = @nextQuantity,
      SoldQuantity = @nextSoldQuantity,
      UpdatedAt = GETDATE()
    WHERE ProductId = @productId
  `);
}

async function clearCartItems(transaction, cartId) {
  const request = await getRequest(transaction);
  request.input('cartId', sql.Int, cartId);
  await request.query('DELETE FROM CartItem WHERE CartId = @cartId');
}

async function createNotification(transaction, payload) {
  const request = await getRequest(transaction);
  request.input('userId', sql.Int, payload.userId);
  request.input('title', sql.NVarChar, payload.title);
  request.input('content', sql.NVarChar, payload.content || null);
  request.input('type', sql.NVarChar, payload.type || null);
  await request.query(`
    INSERT INTO Notification (UserId, Title, Content, Type)
    VALUES (@userId, @title, @content, @type)
  `);
}

async function findAll(query, pagination, currentUser) {
  const request = await createRequest();
  const whereClause = bindOrderFilters(request, query, currentUser);
  request.input('offset', sql.Int, pagination.offset);
  request.input('limit', sql.Int, pagination.limit);
  const result = await request.query(`
    ${ORDER_SELECT}
    WHERE ${whereClause}
    ORDER BY o.CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  return result.recordset;
}

async function countAll(query, currentUser) {
  const request = await createRequest();
  const whereClause = bindOrderFilters(request, query, currentUser);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM [Order] o
    INNER JOIN [User] u ON u.Id = o.UserId
    WHERE ${whereClause}
  `);
  return result.recordset[0].total;
}

async function findById(id, transaction = null) {
  const request = await getRequest(transaction);
  request.input('id', sql.Int, id);
  const result = await request.query(`${ORDER_SELECT} WHERE o.Id = @id`);
  return result.recordset[0] || null;
}

async function findOrderItems(orderId, transaction = null) {
  const request = await getRequest(transaction);
  request.input('orderId', sql.Int, orderId);
  const result = await request.query(`
    SELECT
      Id AS id,
      OrderId AS orderId,
      ProductId AS productId,
      ProductName AS productName,
      Quantity AS quantity,
      UnitPrice AS unitPrice,
      SubTotal AS subTotal
    FROM OrderItem
    WHERE OrderId = @orderId
    ORDER BY Id ASC
  `);
  return result.recordset;
}

async function findPaymentByOrderId(orderId, transaction = null) {
  const request = await getRequest(transaction);
  request.input('orderId', sql.Int, orderId);
  const result = await request.query(`
    SELECT
      Id AS id,
      OrderId AS orderId,
      Method AS method,
      Amount AS amount,
      Status AS status,
      TransactionCode AS transactionCode,
      PaidAt AS paidAt,
      CreatedAt AS createdAt
    FROM Payment
    WHERE OrderId = @orderId
    ORDER BY Id DESC
  `);
  return result.recordset[0] || null;
}

async function updateStatus(id, status, transaction = null) {
  const request = await getRequest(transaction);
  request.input('id', sql.Int, id);
  request.input('status', sql.NVarChar, status);
  await request.query(`
    UPDATE [Order]
    SET Status = @status, UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
}

async function updatePaymentStatus(orderId, paymentStatus, transaction = null) {
  const request = await getRequest(transaction);
  request.input('orderId', sql.Int, orderId);
  request.input('paymentStatus', sql.NVarChar, paymentStatus);
  await request.query(`
    UPDATE [Order]
    SET PaymentStatus = @paymentStatus, UpdatedAt = GETDATE()
    WHERE Id = @orderId
  `);
}

module.exports = {
  findCartByUserId,
  findCartItemsByCartId,
  findAddressByIdAndUser,
  lockInventoryByProductId,
  createOrder,
  createOrderItem,
  createPayment,
  updateInventoryAfterCheckout,
  restoreInventory,
  clearCartItems,
  createNotification,
  findAll,
  countAll,
  findById,
  findOrderItems,
  findPaymentByOrderId,
  updateStatus,
  updatePaymentStatus
};
