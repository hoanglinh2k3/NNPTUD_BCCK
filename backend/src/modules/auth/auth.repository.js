const { createRequest, sql } = require('../../database/connection');

const USER_SELECT = `
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
`;

async function findUserByEmail(email) {
  const request = await createRequest();
  request.input('email', sql.NVarChar, email);
  const result = await request.query(`${USER_SELECT} WHERE u.Email = @email`);
  return result.recordset[0] || null;
}

async function findUserById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`${USER_SELECT} WHERE u.Id = @id`);
  return result.recordset[0] || null;
}

async function findRoleByName(name) {
  const request = await createRequest();
  request.input('name', sql.NVarChar, name);
  const result = await request.query(`
    SELECT Id AS id, Name AS name, Description AS description
    FROM Role
    WHERE Name = @name
  `);
  return result.recordset[0] || null;
}

async function createUser(payload) {
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

  return findUserById(result.recordset[0].id);
}

async function updatePassword(userId, passwordHash) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  request.input('passwordHash', sql.NVarChar, passwordHash);
  await request.query(`
    UPDATE [User]
    SET PasswordHash = @passwordHash, UpdatedAt = GETDATE()
    WHERE Id = @userId
  `);
}

module.exports = {
  findUserByEmail,
  findUserById,
  findRoleByName,
  createUser,
  updatePassword
};
