const { connectDB, createRequest, sql } = require('./connection');
const { hashPassword } = require('../common/utils/password.util');
const slugify = require('../common/helpers/slugify.helper');

async function ensureRole(name, description) {
  const request = await createRequest();
  request.input('name', sql.NVarChar, name);
  const existing = await request.query('SELECT Id AS id FROM Role WHERE Name = @name');

  if (existing.recordset[0]) {
    return existing.recordset[0].id;
  }

  const insertRequest = await createRequest();
  insertRequest.input('name', sql.NVarChar, name);
  insertRequest.input('description', sql.NVarChar, description);
  const result = await insertRequest.query(`
    INSERT INTO Role (Name, Description)
    OUTPUT INSERTED.Id AS id
    VALUES (@name, @description)
  `);
  return result.recordset[0].id;
}

async function ensureUser(payload) {
  const request = await createRequest();
  request.input('email', sql.NVarChar, payload.email);
  const existing = await request.query('SELECT Id AS id FROM [User] WHERE Email = @email');

  if (existing.recordset[0]) {
    return existing.recordset[0].id;
  }

  const passwordHash = await hashPassword(payload.password);
  const insertRequest = await createRequest();
  insertRequest.input('roleId', sql.Int, payload.roleId);
  insertRequest.input('fullName', sql.NVarChar, payload.fullName);
  insertRequest.input('email', sql.NVarChar, payload.email);
  insertRequest.input('passwordHash', sql.NVarChar, passwordHash);
  insertRequest.input('phone', sql.NVarChar, payload.phone);
  const result = await insertRequest.query(`
    INSERT INTO [User] (RoleId, FullName, Email, PasswordHash, Phone)
    OUTPUT INSERTED.Id AS id
    VALUES (@roleId, @fullName, @email, @passwordHash, @phone)
  `);
  return result.recordset[0].id;
}

async function ensureCart(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const existing = await request.query('SELECT Id AS id FROM Cart WHERE UserId = @userId');

  if (!existing.recordset[0]) {
    const insertRequest = await createRequest();
    insertRequest.input('userId', sql.Int, userId);
    await insertRequest.query('INSERT INTO Cart (UserId) VALUES (@userId)');
  }
}

async function ensureAddress(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const existing = await request.query('SELECT TOP 1 Id AS id FROM Address WHERE UserId = @userId');

  if (!existing.recordset[0]) {
    const insertRequest = await createRequest();
    insertRequest.input('userId', sql.Int, userId);
    await insertRequest.query(`
      INSERT INTO Address (
        UserId,
        ReceiverName,
        Phone,
        Province,
        District,
        Ward,
        DetailAddress,
        IsDefault
      )
      VALUES (
        @userId,
        N'Nguyen Customer',
        N'0900000003',
        N'Ho Chi Minh City',
        N'Binh Thanh',
        N'Ward 1',
        N'123 Decor Street',
        1
      )
    `);
  }
}

async function ensureCategory(name, description) {
  const slug = slugify(name);
  const request = await createRequest();
  request.input('slug', sql.NVarChar, slug);
  const existing = await request.query('SELECT Id AS id FROM Category WHERE Slug = @slug');

  if (existing.recordset[0]) {
    return existing.recordset[0].id;
  }

  const insertRequest = await createRequest();
  insertRequest.input('name', sql.NVarChar, name);
  insertRequest.input('slug', sql.NVarChar, slug);
  insertRequest.input('description', sql.NVarChar, description);
  const result = await insertRequest.query(`
    INSERT INTO Category (Name, Slug, Description)
    OUTPUT INSERTED.Id AS id
    VALUES (@name, @slug, @description)
  `);
  return result.recordset[0].id;
}

async function ensureProduct(payload) {
  const request = await createRequest();
  request.input('sku', sql.NVarChar, payload.sku);
  const existing = await request.query('SELECT Id AS id FROM Product WHERE SKU = @sku');

  let productId = existing.recordset[0]?.id;

  if (!productId) {
    const insertRequest = await createRequest();
    insertRequest.input('categoryId', sql.Int, payload.categoryId);
    insertRequest.input('name', sql.NVarChar, payload.name);
    insertRequest.input('slug', sql.NVarChar, slugify(payload.name));
    insertRequest.input('description', sql.NVarChar, payload.description);
    insertRequest.input('price', sql.Decimal(18, 2), payload.price);
    insertRequest.input('discountPrice', sql.Decimal(18, 2), payload.discountPrice || null);
    insertRequest.input('sku', sql.NVarChar, payload.sku);
    insertRequest.input('material', sql.NVarChar, payload.material);
    insertRequest.input('color', sql.NVarChar, payload.color);
    insertRequest.input('size', sql.NVarChar, payload.size);
    insertRequest.input('collectionName', sql.NVarChar, payload.collectionName);
    insertRequest.input('status', sql.NVarChar, 'ACTIVE');
    const result = await insertRequest.query(`
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
    productId = result.recordset[0].id;
  }

  const inventoryRequest = await createRequest();
  inventoryRequest.input('productId', sql.Int, productId);
  const inventory = await inventoryRequest.query('SELECT Id AS id FROM Inventory WHERE ProductId = @productId');

  if (!inventory.recordset[0]) {
    const insertInventory = await createRequest();
    insertInventory.input('productId', sql.Int, productId);
    insertInventory.input('quantity', sql.Int, payload.quantity);
    await insertInventory.query(`
      INSERT INTO Inventory (ProductId, Quantity, ReservedQuantity, SoldQuantity)
      VALUES (@productId, @quantity, 0, 0)
    `);
  }
}

async function run() {
  await connectDB();

  const adminRoleId = await ensureRole('Admin', 'System administrator');
  const staffRoleId = await ensureRole('Staff', 'Operations staff');
  const customerRoleId = await ensureRole('Customer', 'Store customer');

  await ensureUser({
    roleId: adminRoleId,
    fullName: 'Admin Account',
    email: 'admin@decor.local',
    phone: '0900000001',
    password: 'Pass@123'
  });

  await ensureUser({
    roleId: staffRoleId,
    fullName: 'Staff Account',
    email: 'staff@decor.local',
    phone: '0900000002',
    password: 'Pass@123'
  });

  const customerId = await ensureUser({
    roleId: customerRoleId,
    fullName: 'Customer Account',
    email: 'customer@decor.local',
    phone: '0900000003',
    password: 'Pass@123'
  });

  await ensureCart(customerId);
  await ensureAddress(customerId);

  const lampCategoryId = await ensureCategory('Decor Lamps', 'Warm ambient lamps');
  const artCategoryId = await ensureCategory('Wall Art', 'Canvas and framed decor');

  await ensureProduct({
    categoryId: lampCategoryId,
    name: 'Oak Mood Lamp',
    description: 'Warm wood lamp for bedside styling',
    price: 420000,
    discountPrice: 369000,
    sku: 'DECOR-SEED-001',
    material: 'Wood',
    color: 'Oak',
    size: '30x18 cm',
    collectionName: 'Warm Living',
    quantity: 20
  });

  await ensureProduct({
    categoryId: artCategoryId,
    name: 'Neutral Gallery Frame',
    description: 'Soft framed print for modern walls',
    price: 540000,
    discountPrice: null,
    sku: 'DECOR-SEED-002',
    material: 'Canvas',
    color: 'Beige',
    size: '50x70 cm',
    collectionName: 'Gallery Calm',
    quantity: 15
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', error);
  process.exit(1);
});
