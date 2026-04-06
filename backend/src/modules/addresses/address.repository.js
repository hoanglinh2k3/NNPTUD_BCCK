const { createRequest, sql } = require('../../database/connection');

async function findAllByUserId(userId) {
  const request = await createRequest();
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
      IsDefault AS isDefault,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
    FROM Address
    WHERE UserId = @userId
    ORDER BY IsDefault DESC, UpdatedAt DESC
  `);
  return result.recordset;
}

async function countByUserId(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM Address
    WHERE UserId = @userId
  `);
  return result.recordset[0].total;
}

async function findByIdAndUser(id, userId) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
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
      IsDefault AS isDefault,
      CreatedAt AS createdAt,
      UpdatedAt AS updatedAt
    FROM Address
    WHERE Id = @id AND UserId = @userId
  `);
  return result.recordset[0] || null;
}

async function clearDefault(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  await request.query(`
    UPDATE Address
    SET IsDefault = 0, UpdatedAt = GETDATE()
    WHERE UserId = @userId
  `);
}

async function create(userId, payload) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  request.input('receiverName', sql.NVarChar, payload.receiverName);
  request.input('phone', sql.NVarChar, payload.phone);
  request.input('province', sql.NVarChar, payload.province || null);
  request.input('district', sql.NVarChar, payload.district || null);
  request.input('ward', sql.NVarChar, payload.ward || null);
  request.input('detailAddress', sql.NVarChar, payload.detailAddress || null);
  request.input('isDefault', sql.Bit, payload.isDefault ? 1 : 0);
  const result = await request.query(`
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
    OUTPUT INSERTED.Id AS id
    VALUES (
      @userId,
      @receiverName,
      @phone,
      @province,
      @district,
      @ward,
      @detailAddress,
      @isDefault
    )
  `);
  return findByIdAndUser(result.recordset[0].id, userId);
}

async function update(id, userId, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('userId', sql.Int, userId);
  request.input('receiverName', sql.NVarChar, payload.receiverName);
  request.input('phone', sql.NVarChar, payload.phone);
  request.input('province', sql.NVarChar, payload.province || null);
  request.input('district', sql.NVarChar, payload.district || null);
  request.input('ward', sql.NVarChar, payload.ward || null);
  request.input('detailAddress', sql.NVarChar, payload.detailAddress || null);
  request.input('isDefault', sql.Bit, payload.isDefault ? 1 : 0);
  await request.query(`
    UPDATE Address
    SET
      ReceiverName = @receiverName,
      Phone = @phone,
      Province = @province,
      District = @district,
      Ward = @ward,
      DetailAddress = @detailAddress,
      IsDefault = @isDefault,
      UpdatedAt = GETDATE()
    WHERE Id = @id AND UserId = @userId
  `);
  return findByIdAndUser(id, userId);
}

async function remove(id, userId) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('userId', sql.Int, userId);
  await request.query('DELETE FROM Address WHERE Id = @id AND UserId = @userId');
}

module.exports = {
  findAllByUserId,
  countByUserId,
  findByIdAndUser,
  clearDefault,
  create,
  update,
  remove
};
