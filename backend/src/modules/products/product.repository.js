const { createRequest, createTransaction, sql } = require('../../database/connection');

const PRODUCT_SELECT = `
  SELECT
    p.Id AS id,
    p.CategoryId AS categoryId,
    c.Name AS categoryName,
    p.Name AS name,
    p.Slug AS slug,
    p.Description AS description,
    p.Price AS price,
    p.DiscountPrice AS discountPrice,
    p.SKU AS sku,
    p.Material AS material,
    p.Color AS color,
    p.Size AS size,
    p.CollectionName AS collectionName,
    p.Status AS status,
    p.CreatedAt AS createdAt,
    p.UpdatedAt AS updatedAt,
    image.ImageUrl AS primaryImage,
    ISNULL(inv.Quantity, 0) AS quantity,
    ISNULL(inv.ReservedQuantity, 0) AS reservedQuantity,
    ISNULL(inv.SoldQuantity, 0) AS soldQuantity,
    ISNULL(review.reviewCount, 0) AS reviewCount,
    ISNULL(review.avgRating, 0) AS avgRating
  FROM Product p
  INNER JOIN Category c ON c.Id = p.CategoryId
  LEFT JOIN ProductImage image ON image.ProductId = p.Id AND image.IsPrimary = 1
  LEFT JOIN Inventory inv ON inv.ProductId = p.Id
  LEFT JOIN (
    SELECT
      ProductId,
      COUNT(*) AS reviewCount,
      AVG(CAST(Rating AS FLOAT)) AS avgRating
    FROM Review
    WHERE Status = 'VISIBLE'
    GROUP BY ProductId
  ) review ON review.ProductId = p.Id
`;

function bindProductFilters(request, query = {}) {
  const conditions = ['1 = 1'];

  if (query.keyword) {
    request.input('keyword', sql.NVarChar, `%${query.keyword}%`);
    conditions.push('(p.Name LIKE @keyword OR p.SKU LIKE @keyword OR p.CollectionName LIKE @keyword)');
  }

  if (query.categoryId) {
    request.input('categoryId', sql.Int, Number(query.categoryId));
    conditions.push('p.CategoryId = @categoryId');
  }

  if (query.minPrice !== undefined) {
    request.input('minPrice', sql.Decimal(18, 2), Number(query.minPrice));
    conditions.push('COALESCE(p.DiscountPrice, p.Price) >= @minPrice');
  }

  if (query.maxPrice !== undefined) {
    request.input('maxPrice', sql.Decimal(18, 2), Number(query.maxPrice));
    conditions.push('COALESCE(p.DiscountPrice, p.Price) <= @maxPrice');
  }

  if (query.material) {
    request.input('material', sql.NVarChar, `%${query.material}%`);
    conditions.push('p.Material LIKE @material');
  }

  if (query.color) {
    request.input('color', sql.NVarChar, `%${query.color}%`);
    conditions.push('p.Color LIKE @color');
  }

  if (query.status) {
    request.input('status', sql.NVarChar, query.status);
    conditions.push('p.Status = @status');
  } else {
    conditions.push("p.Status <> 'INACTIVE'");
  }

  return conditions.join(' AND ');
}

function getOrderClause(sortBy) {
  switch (sortBy) {
    case 'priceAsc':
      return 'COALESCE(p.DiscountPrice, p.Price) ASC';
    case 'priceDesc':
      return 'COALESCE(p.DiscountPrice, p.Price) DESC';
    case 'bestSelling':
      return 'ISNULL(inv.SoldQuantity, 0) DESC, p.CreatedAt DESC';
    case 'latest':
    default:
      return 'p.CreatedAt DESC';
  }
}

async function findAll(query, pagination) {
  const request = await createRequest();
  const whereClause = bindProductFilters(request, query);
  request.input('offset', sql.Int, pagination.offset);
  request.input('limit', sql.Int, pagination.limit);
  const orderClause = getOrderClause(query.sortBy);
  const result = await request.query(`
    ${PRODUCT_SELECT}
    WHERE ${whereClause}
    ORDER BY ${orderClause}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  return result.recordset;
}

async function countAll(query) {
  const request = await createRequest();
  const whereClause = bindProductFilters(request, query);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Product p
    LEFT JOIN Inventory inv ON inv.ProductId = p.Id
    WHERE ${whereClause}
  `);
  return result.recordset[0].total;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`${PRODUCT_SELECT} WHERE p.Id = @id`);
  return result.recordset[0] || null;
}

async function findImages(productId) {
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

async function findBySlug(slug) {
  const request = await createRequest();
  request.input('slug', sql.NVarChar, slug);
  const result = await request.query(`${PRODUCT_SELECT} WHERE p.Slug = @slug`);
  return result.recordset[0] || null;
}

async function findBySku(sku) {
  const request = await createRequest();
  request.input('sku', sql.NVarChar, sku);
  const result = await request.query(`
    SELECT
      Id AS id,
      CategoryId AS categoryId,
      Name AS name,
      Slug AS slug,
      Description AS description,
      Price AS price,
      DiscountPrice AS discountPrice,
      SKU AS sku,
      Material AS material,
      Color AS color,
      Size AS size,
      CollectionName AS collectionName,
      Status AS status
    FROM Product
    WHERE SKU = @sku
  `);
  return result.recordset[0] || null;
}

async function findCategoryById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT Id AS id, Name AS name
    FROM Category
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function create(payload) {
  const transaction = await createTransaction();

  try {
    const request = transaction.request();
    request.input('categoryId', sql.Int, payload.categoryId);
    request.input('name', sql.NVarChar, payload.name);
    request.input('slug', sql.NVarChar, payload.slug);
    request.input('description', sql.NVarChar, payload.description || null);
    request.input('price', sql.Decimal(18, 2), payload.price);
    request.input('discountPrice', sql.Decimal(18, 2), payload.discountPrice || null);
    request.input('sku', sql.NVarChar, payload.sku);
    request.input('material', sql.NVarChar, payload.material || null);
    request.input('color', sql.NVarChar, payload.color || null);
    request.input('size', sql.NVarChar, payload.size || null);
    request.input('collectionName', sql.NVarChar, payload.collectionName || null);
    request.input('status', sql.NVarChar, payload.status || 'ACTIVE');

    const createdProduct = await request.query(`
      INSERT INTO Product (
        CategoryId,
        Name,
        Slug,
        Description,
        Price,
        DiscountPrice,
        SKU,
        Material,
        Color,
        Size,
        CollectionName,
        Status
      )
      OUTPUT INSERTED.Id AS id
      VALUES (
        @categoryId,
        @name,
        @slug,
        @description,
        @price,
        @discountPrice,
        @sku,
        @material,
        @color,
        @size,
        @collectionName,
        @status
      )
    `);

    const productId = createdProduct.recordset[0].id;
    const inventoryRequest = transaction.request();
    inventoryRequest.input('productId', sql.Int, productId);
    await inventoryRequest.query(`
      INSERT INTO Inventory (ProductId, Quantity, ReservedQuantity, SoldQuantity)
      VALUES (@productId, 0, 0, 0)
    `);

    await transaction.commit();
    return findById(productId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function update(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('categoryId', sql.Int, payload.categoryId);
  request.input('name', sql.NVarChar, payload.name);
  request.input('slug', sql.NVarChar, payload.slug);
  request.input('description', sql.NVarChar, payload.description || null);
  request.input('price', sql.Decimal(18, 2), payload.price);
  request.input('discountPrice', sql.Decimal(18, 2), payload.discountPrice || null);
  request.input('sku', sql.NVarChar, payload.sku);
  request.input('material', sql.NVarChar, payload.material || null);
  request.input('color', sql.NVarChar, payload.color || null);
  request.input('size', sql.NVarChar, payload.size || null);
  request.input('collectionName', sql.NVarChar, payload.collectionName || null);
  request.input('status', sql.NVarChar, payload.status);
  await request.query(`
    UPDATE Product
    SET
      CategoryId = @categoryId,
      Name = @name,
      Slug = @slug,
      Description = @description,
      Price = @price,
      DiscountPrice = @discountPrice,
      SKU = @sku,
      Material = @material,
      Color = @color,
      Size = @size,
      CollectionName = @collectionName,
      Status = @status,
      UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function softDelete(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query(`
    UPDATE Product
    SET Status = 'INACTIVE', UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

module.exports = {
  findAll,
  countAll,
  findById,
  findImages,
  findBySlug,
  findBySku,
  findCategoryById,
  create,
  update,
  softDelete
};
