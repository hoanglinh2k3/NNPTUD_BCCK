const { createRequest, sql } = require('../../database/connection');

const ROLE_SELECT = `
  SELECT
    Id AS id,
    Name AS name,
    Description AS description,
    CreatedAt AS createdAt,
    UpdatedAt AS updatedAt
  FROM Role
`;

async function findAll() {
  const request = await createRequest();
  const result = await request.query(`${ROLE_SELECT} ORDER BY Id ASC`);
  return result.recordset;
}

async function findById(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`${ROLE_SELECT} WHERE Id = @id`);
  return result.recordset[0] || null;
}

async function findByName(name) {
  const request = await createRequest();
  request.input('name', sql.NVarChar, name);
  const result = await request.query(`${ROLE_SELECT} WHERE Name = @name`);
  return result.recordset[0] || null;
}

async function create(payload) {
  const request = await createRequest();
  request.input('name', sql.NVarChar, payload.name);
  request.input('description', sql.NVarChar, payload.description || null);
  const result = await request.query(`
    INSERT INTO Role (Name, Description)
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.Name AS name,
      INSERTED.Description AS description,
      INSERTED.CreatedAt AS createdAt,
      INSERTED.UpdatedAt AS updatedAt
    VALUES (@name, @description)
  `);
  return result.recordset[0];
}

async function update(id, payload) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  request.input('name', sql.NVarChar, payload.name);
  request.input('description', sql.NVarChar, payload.description || null);
  const result = await request.query(`
    UPDATE Role
    SET Name = @name, Description = @description, UpdatedAt = GETDATE()
    OUTPUT
      INSERTED.Id AS id,
      INSERTED.Name AS name,
      INSERTED.Description AS description,
      INSERTED.CreatedAt AS createdAt,
      INSERTED.UpdatedAt AS updatedAt
    WHERE Id = @id
  `);
  return result.recordset[0] || null;
}

async function countUsersByRoleId(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT COUNT(*) AS total
    FROM [User]
    WHERE RoleId = @id
  `);
  return result.recordset[0].total;
}

async function remove(id) {
  const request = await createRequest();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM Role WHERE Id = @id');
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  countUsersByRoleId,
  remove
};
