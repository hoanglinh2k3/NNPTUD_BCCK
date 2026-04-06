const { createRequest, sql } = require('../../database/connection');

const USER_SELECT = `
  SELECT
    u.Id AS id,
    u.RoleId AS roleId,
    r.Name AS role,
    u.FullName AS fullName,
    u.Email AS email,
    u.Phone AS phone,
    u.AvatarUrl AS avatarUrl,
    u.Status AS status,
    u.CreatedAt AS createdAt,
    u.UpdatedAt AS updatedAt
  FROM [User] u
  INNER JOIN Role r ON r.Id = u.RoleId
`;

function bindUserFilters(request, filters = {}) {
  const conditions = ['1 = 1'];

  if (filters.keyword) {
    request.input('keyword', sql.NVarChar, `%${filters.keyword}%`);
    conditions.push('(u.FullName LIKE @keyword OR u.Email LIKE @keyword OR u.Phone LIKE @keyword)');
  }

  if (filters.roleId) {
    request.input('roleId', sql.Int, Number(filters.roleId));
    conditions.push('u.RoleId = @roleId');
  }

  if (filters.status) {
    request.input('status', sql.NVarChar, filters.status);
    conditions.push('u.Status = @status');
  }

  return conditions.join(' AND ');
}

async function findAll(filters, pagination) {
  const request = await createRequest();
  const whereClause = bindUserFilters(request, filters);
  request.input('offset', sql.Int, pagination.offset);
  request.input('limit', sql.Int, pagination.limit);

  const result = await request.query(`
    ${USER_SELECT}
    WHERE ${whereClause}
    ORDER BY u.CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return result.recordset;
}

async function countAll(filters) {
  const request = await createRequest();
  const whereClause = bindUserFilters(request, filters);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM [User] u
    INNER JOIN Role r ON r.Id = u.RoleId
    WHERE ${whereClause}
  `);
  return result.recordset[0].total;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`${USER_SELECT} WHERE u.Id = @id`);
  return result.recordset[0] || null;
}

async function findAuthById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT
      u.Id AS id,
      u.RoleId AS roleId,
      r.Name AS role,
      u.FullName AS fullName,
      u.Email AS email,
      u.PasswordHash AS passwordHash,
      u.Phone AS phone,
      u.AvatarUrl AS avatarUrl,
      u.Status AS status,
      u.CreatedAt AS createdAt,
      u.UpdatedAt AS updatedAt
    FROM [User] u
    INNER JOIN Role r ON r.Id = u.RoleId
    WHERE u.Id = @id
  `);
  return result.recordset[0] || null;
}

async function findByEmail(email) {
  const request = await createRequest();
  request.input('email', sql.NVarChar, email);
  const result = await request.query(`
    SELECT TOP 1
      Id AS id,
      RoleId AS roleId,
      FullName AS fullName,
      Email AS email,
      Phone AS phone,
      AvatarUrl AS avatarUrl,
      Status AS status
    FROM [User]
    WHERE Email = @email
  `);
  return result.recordset[0] || null;
}

async function findRoleById(roleId) {
  const request = await createRequest();
  request.input('roleId', sql.Int, roleId);
  const result = await request.query(`
    SELECT Id AS id, Name AS name, Description AS description
    FROM Role
    WHERE Id = @roleId
  `);
  return result.recordset[0] || null;
}

async function create(payload) {
  const request = await createRequest();
  request.input('roleId', sql.Int, payload.roleId);
  request.input('fullName', sql.NVarChar, payload.fullName);
  request.input('email', sql.NVarChar, payload.email);
  request.input('passwordHash', sql.NVarChar, payload.passwordHash);
  request.input('phone', sql.NVarChar, payload.phone || null);
  const result = await request.query(`
    INSERT INTO [User] (RoleId, FullName, Email, PasswordHash, Phone)
    OUTPUT INSERTED.Id AS id
    VALUES (@roleId, @fullName, @email, @passwordHash, @phone)
  `);
  return findById(result.recordset[0].id);
}

async function update(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('roleId', sql.Int, payload.roleId);
  request.input('fullName', sql.NVarChar, payload.fullName);
  request.input('email', sql.NVarChar, payload.email);
  request.input('phone', sql.NVarChar, payload.phone || null);
  request.input('status', sql.NVarChar, payload.status);
  await request.query(`
    UPDATE [User]
    SET
      RoleId = @roleId,
      FullName = @fullName,
      Email = @email,
      Phone = @phone,
      Status = @status,
      UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function updateStatus(id, status) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('status', sql.NVarChar, status);
  await request.query(`
    UPDATE [User]
    SET Status = @status, UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function updateProfile(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('fullName', sql.NVarChar, payload.fullName);
  request.input('phone', sql.NVarChar, payload.phone || null);
  await request.query(`
    UPDATE [User]
    SET FullName = @fullName, Phone = @phone, UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

async function updateAvatar(id, avatarUrl) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('avatarUrl', sql.NVarChar, avatarUrl);
  await request.query(`
    UPDATE [User]
    SET AvatarUrl = @avatarUrl, UpdatedAt = GETDATE()
    WHERE Id = @id
  `);
  return findById(id);
}

module.exports = {
  findAll,
  countAll,
  findById,
  findAuthById,
  findByEmail,
  findRoleById,
  create,
  update,
  updateStatus,
  updateProfile,
  updateAvatar
};
