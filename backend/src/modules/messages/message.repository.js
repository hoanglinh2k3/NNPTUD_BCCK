const { createRequest, sql } = require('../../database/connection');

async function findUserById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT
      Id AS id,
      FullName AS fullName,
      AvatarUrl AS avatarUrl
    FROM [User]
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function findConversations(userId) {
  const request = await createRequest();
  request.input('userId', sql.Int, userId);
  const result = await request.query(`
    WITH ConversationFeed AS (
      SELECT
        Id,
        CASE
          WHEN SenderId = @userId THEN ReceiverId
          ELSE SenderId
        END AS PartnerId,
        SenderId,
        ReceiverId,
        Content,
        MessageType,
        FileUrl,
        IsRead,
        CreatedAt,
        ROW_NUMBER() OVER (
          PARTITION BY CASE WHEN SenderId = @userId THEN ReceiverId ELSE SenderId END
          ORDER BY CreatedAt DESC, Id DESC
        ) AS rn
      FROM Message
      WHERE SenderId = @userId OR ReceiverId = @userId
    )
    SELECT
      cf.Id AS id,
      cf.PartnerId AS userId,
      u.FullName AS fullName,
      u.AvatarUrl AS avatarUrl,
      cf.SenderId AS senderId,
      cf.ReceiverId AS receiverId,
      cf.Content AS content,
      cf.MessageType AS messageType,
      cf.FileUrl AS fileUrl,
      cf.IsRead AS isRead,
      cf.CreatedAt AS createdAt
    FROM ConversationFeed cf
    INNER JOIN [User] u ON u.Id = cf.PartnerId
    WHERE cf.rn = 1
    ORDER BY cf.CreatedAt DESC, cf.Id DESC
  `);
  return result.recordset;
}

async function findSupportContact(currentUserId) {
  const request = await createRequest();
  request.input('currentUserId', sql.Int, currentUserId);
  const result = await request.query(`
    SELECT TOP 1
      u.Id AS userId,
      u.FullName AS fullName,
      u.AvatarUrl AS avatarUrl,
      r.Name AS role
    FROM [User] u
    INNER JOIN Role r ON r.Id = u.RoleId
    WHERE
      u.Id <> @currentUserId
      AND u.Status = 'ACTIVE'
      AND r.Name IN ('Staff', 'Admin')
    ORDER BY CASE WHEN r.Name = 'Staff' THEN 1 ELSE 2 END, u.Id ASC
  `);
  return result.recordset[0] || null;
}

async function findMessagesBetweenUsers(currentUserId, otherUserId) {
  const request = await createRequest();
  request.input('currentUserId', sql.Int, currentUserId);
  request.input('otherUserId', sql.Int, otherUserId);
  const result = await request.query(`
    SELECT
      Id AS id,
      SenderId AS senderId,
      ReceiverId AS receiverId,
      Content AS content,
      MessageType AS messageType,
      FileUrl AS fileUrl,
      IsRead AS isRead,
      CreatedAt AS createdAt
    FROM Message
    WHERE
      (SenderId = @currentUserId AND ReceiverId = @otherUserId)
      OR
      (SenderId = @otherUserId AND ReceiverId = @currentUserId)
    ORDER BY CreatedAt ASC, Id ASC
  `);
  return result.recordset;
}

async function create(payload) {
  const request = await createRequest();
  request.input('senderId', sql.Int, payload.senderId);
  request.input('receiverId', sql.Int, payload.receiverId);
  request.input('content', sql.NVarChar, payload.content || null);
  request.input('messageType', sql.NVarChar, payload.messageType);
  request.input('fileUrl', sql.NVarChar, payload.fileUrl || null);
  const result = await request.query(`
    INSERT INTO Message (SenderId, ReceiverId, Content, MessageType, FileUrl)
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.SenderId AS senderId,
      INSERTED.ReceiverId AS receiverId,
      INSERTED.Content AS content,
      INSERTED.MessageType AS messageType,
      INSERTED.FileUrl AS fileUrl,
      INSERTED.IsRead AS isRead,
      INSERTED.CreatedAt AS createdAt
    VALUES (@senderId, @receiverId, @content, @messageType, @fileUrl)
  `);
  return result.recordset[0];
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT
      Id AS id,
      SenderId AS senderId,
      ReceiverId AS receiverId,
      Content AS content,
      MessageType AS messageType,
      FileUrl AS fileUrl,
      IsRead AS isRead,
      CreatedAt AS createdAt
    FROM Message
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function markAsRead(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query(`
    UPDATE Message
    SET IsRead = 1
    WHERE Id = @id
  `);
  return findById(id);
}

module.exports = {
  findUserById,
  findConversations,
  findSupportContact,
  findMessagesBetweenUsers,
  create,
  findById,
  markAsRead
};
