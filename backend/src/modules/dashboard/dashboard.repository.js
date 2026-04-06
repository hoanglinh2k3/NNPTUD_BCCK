const { createRequest, sql } = require('../../database/connection');

function bindRevenueFilters(request, query = {}) {
  const conditions = ["o.Status <> 'CANCELLED'"];

  if (query.fromDate) {
    request.input('fromDate', sql.Date, query.fromDate);
    conditions.push('CAST(o.CreatedAt AS DATE) >= @fromDate');
  }

  if (query.toDate) {
    request.input('toDate', sql.Date, query.toDate);
    conditions.push('CAST(o.CreatedAt AS DATE) <= @toDate');
  }

  return conditions.join(' AND ');
}

function getRevenueGroupExpression(groupBy = 'month') {
  switch (groupBy) {
    case 'day':
      return "CONVERT(VARCHAR(10), o.CreatedAt, 23)";
    case 'year':
      return "CONVERT(VARCHAR(4), YEAR(o.CreatedAt))";
    case 'month':
    default:
      return "CONCAT(YEAR(o.CreatedAt), '-', RIGHT('0' + CONVERT(VARCHAR(2), MONTH(o.CreatedAt)), 2))";
  }
}

async function getSummary() {
  const request = await createRequest();
  const result = await request.query(`
    SELECT
      (SELECT COUNT(*) FROM [User]) AS totalUsers,
      (SELECT COUNT(*) FROM Product) AS totalProducts,
      (SELECT COUNT(*) FROM [Order]) AS totalOrders,
      (SELECT COUNT(*) FROM [Order] WHERE Status = 'PENDING') AS pendingOrders,
      (
        SELECT ISNULL(SUM(TotalAmount), 0)
        FROM [Order]
        WHERE Status <> 'CANCELLED' AND (PaymentStatus = 'PAID' OR Status = 'DELIVERED')
      ) AS totalRevenue
  `);
  return result.recordset[0];
}

async function getRevenue(query = {}) {
  const request = await createRequest();
  const whereClause = bindRevenueFilters(request, query);
  const periodExpression = getRevenueGroupExpression(query.groupBy);
  const result = await request.query(`
    SELECT
      ${periodExpression} AS period,
      COUNT(*) AS totalOrders,
      ISNULL(SUM(o.TotalAmount), 0) AS totalRevenue
    FROM [Order] o
    WHERE ${whereClause}
    GROUP BY ${periodExpression}
    ORDER BY period ASC
  `);
  return result.recordset;
}

async function getTopProducts() {
  const request = await createRequest();
  const result = await request.query(`
    SELECT TOP 10
      oi.ProductId AS productId,
      oi.ProductName AS productName,
      SUM(oi.Quantity) AS totalSold,
      SUM(oi.SubTotal) AS revenue
    FROM OrderItem oi
    INNER JOIN [Order] o ON o.Id = oi.OrderId
    WHERE o.Status <> 'CANCELLED'
    GROUP BY oi.ProductId, oi.ProductName
    ORDER BY totalSold DESC, revenue DESC
  `);
  return result.recordset;
}

async function getLowStock() {
  const request = await createRequest();
  const result = await request.query(`
    SELECT TOP 10
      i.ProductId AS productId,
      p.Name AS productName,
      p.SKU AS sku,
      i.Quantity AS quantity,
      i.ReservedQuantity AS reservedQuantity,
      i.SoldQuantity AS soldQuantity
    FROM Inventory i
    INNER JOIN Product p ON p.Id = i.ProductId
    ORDER BY i.Quantity ASC, i.ReservedQuantity DESC
  `);
  return result.recordset;
}

module.exports = {
  getSummary,
  getRevenue,
  getTopProducts,
  getLowStock
};
