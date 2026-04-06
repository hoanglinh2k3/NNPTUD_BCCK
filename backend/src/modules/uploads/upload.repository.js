const { createRequest, sql } = require('../../database/connection');

async function create(payload) {
  const request = await createRequest();
  request.input('userId', sql.Int, payload.userId || null);
  request.input('originalName', sql.NVarChar, payload.originalName);
  request.input('storedName', sql.NVarChar, payload.storedName);
  request.input('filePath', sql.NVarChar, payload.filePath);
  request.input('mimeType', sql.NVarChar, payload.mimeType || null);
  request.input('fileSize', sql.BigInt, payload.fileSize || null);
  request.input('uploadType', sql.NVarChar, payload.uploadType || null);
  const result = await request.query(`
    INSERT INTO UploadFile (
      UserId,
      OriginalName,
      StoredName,
      FilePath,
      MimeType,
      FileSize,
      UploadType
    )
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.UserId AS userId,
      INSERTED.OriginalName AS originalName,
      INSERTED.StoredName AS storedName,
      INSERTED.FilePath AS filePath,
      INSERTED.MimeType AS mimeType,
      INSERTED.FileSize AS fileSize,
      INSERTED.UploadType AS uploadType,
      INSERTED.CreatedAt AS createdAt
    VALUES (
      @userId,
      @originalName,
      @storedName,
      @filePath,
      @mimeType,
      @fileSize,
      @uploadType
    )
  `);
  return result.recordset[0];
}

module.exports = {
  create
};
