const { createRequest, sql } = require('../../database/connection');

async function findOrderById(orderId) {
  const request = await createRequest();
  request.input('orderId', sql.Int, orderId);
  const result = await request.query(`
    SELECT
      o.Id AS id,
      o.UserId AS userId,
      o.OrderCode AS orderCode,
      o.TotalAmount AS totalAmount,
      o.Status AS status,
      o.PaymentStatus AS paymentStatus
    FROM [Order] o
    WHERE o.Id = @orderId
  `);
  return result.recordset[0] || null;
}

async function create(payload) {
  const request = await createRequest();
  request.input('orderId', sql.Int, payload.orderId);
  request.input('method', sql.NVarChar, payload.method);
  request.input('amount', sql.Decimal(18, 2), payload.amount);
  request.input('status', sql.NVarChar, payload.status);
  const result = await request.query(`
    INSERT INTO Payment (OrderId, Method, Amount, Status)
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.OrderId AS orderId,
      INSERTED.Method AS method,
      INSERTED.Amount AS amount,
      INSERTED.Status AS status,
      INSERTED.TransactionCode AS transactionCode,
      INSERTED.PaidAt AS paidAt,
      INSERTED.CreatedAt AS createdAt
    VALUES (@orderId, @method, @amount, @status)
  `);
  return result.recordset[0];
}

async function findByOrderId(orderId) {
  const request = await createRequest();
  request.input('orderId', sql.Int, orderId);
  const result = await request.query(`
    SELECT TOP 1
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

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
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
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function updateStatus(id, status, transactionCode) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('status', sql.NVarChar, status);
  request.input('transactionCode', sql.NVarChar, transactionCode || null);
  await request.query(`
    UPDATE Payment
    SET
      Status = @status,
      TransactionCode = @transactionCode,
      PaidAt = CASE WHEN @status = 'PAID' THEN GETDATE() ELSE PaidAt END
    WHERE Id = @id
  `);
  return findById(id);
}

async function syncOrderPaymentStatus(orderId, paymentStatus) {
  const request = await createRequest();
  request.input('orderId', sql.Int, orderId);
  request.input('paymentStatus', sql.NVarChar, paymentStatus);
  await request.query(`
    UPDATE [Order]
    SET PaymentStatus = @paymentStatus, UpdatedAt = GETDATE()
    WHERE Id = @orderId
  `);
}

module.exports = {
  findOrderById,
  create,
  findByOrderId,
  findById,
  updateStatus,
  syncOrderPaymentStatus
};
