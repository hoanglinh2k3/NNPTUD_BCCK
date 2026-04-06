const { createRequest, sql } = require('../../database/connection');

async function findAllByUserId(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      Title AS title,
      Content AS content,
      Type AS type,
      IsRead AS isRead,
      CreatedAt AS createdAt
    FROM Notification
    WHERE UserId = @userId
    ORDER BY CreatedAt DESC, Id DESC
  `);
  return result.recordset;
}

async function create(payload) {
  const request = await createRequest();
  request.input('userId', sql.Int, payload.userId);
  request.input('title', sql.NVarChar, payload.title);
  request.input('content', sql.NVarChar, payload.content || null);
  request.input('type', sql.NVarChar, payload.type || null);
  const result = await request.query(`
    INSERT INTO Notification (UserId, Title, Content, Type)
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.UserId AS userId,
      INSERTED.Title AS title,
      INSERTED.Content AS content,
      INSERTED.Type AS type,
      INSERTED.IsRead AS isRead,
      INSERTED.CreatedAt AS createdAt
    VALUES (@userId, @title, @content, @type)
  `);
  return result.recordset[0];
}

async function findAvailableRecipients() {
  const request = await createRequest();
  const result = await request.query(`
    SELECT
      u.Id AS userId,
      u.FullName AS fullName,
      u.Email AS email,
      r.Name AS role,
      u.Status AS status
    FROM [User] u
    INNER JOIN Role r ON r.Id = u.RoleId
    WHERE u.Status = 'ACTIVE'
    ORDER BY
      CASE r.Name WHEN 'Customer' THEN 1 WHEN 'Staff' THEN 2 ELSE 3 END,
      u.FullName ASC,
      u.Id ASC
  `);
  return result.recordset;
}

async function findRecipientsByRole(roleName) {
  const request = await createRequest();
  request.input('roleName', sql.NVarChar, roleName);
  const result = await request.query(`
    SELECT
      u.Id AS userId,
      u.FullName AS fullName,
      u.Email AS email,
      r.Name AS role,
      u.Status AS status
    FROM [User] u
    INNER JOIN Role r ON r.Id = u.RoleId
    WHERE u.Status = 'ACTIVE' AND r.Name = @roleName
    ORDER BY u.FullName ASC, u.Id ASC
  `);
  return result.recordset;
}

async function findByIdAndUser(id, userId) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    SELECT
      Id AS id,
      UserId AS userId,
      Title AS title,
      Content AS content,
      Type AS type,
      IsRead AS isRead,
      CreatedAt AS createdAt
    FROM Notification
    WHERE Id = @id AND UserId = @userId
  `);
  return result.recordset[0] || null;
}

async function markRead(id, userId, isRead) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('userId', sql.Int, userId);
  request.input('isRead', sql.Bit, isRead ? 1 : 0);
  await request.query(`
    UPDATE Notification
    SET IsRead = @isRead
    WHERE Id = @id AND UserId = @userId
  `);
  return findByIdAndUser(id, userId);
}

async function markAllRead(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  await request.query(`
    UPDATE Notification
    SET IsRead = 1
    WHERE UserId = @userId
  `);
}

module.exports = {
  findAllByUserId,
  create,
  findAvailableRecipients,
  findRecipientsByRole,
  findByIdAndUser,
  markRead,
  markAllRead
};
