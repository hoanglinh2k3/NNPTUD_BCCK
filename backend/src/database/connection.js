const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/database');

let poolPromise;

async function connectDB() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }

  return poolPromise;
}

async function getPool() {
  return connectDB();
}

async function createRequest(transaction = null) {
  if (transaction) {
    return transaction.request();
  }

  const pool = await connectDB();
  return pool.request();
}

async function createTransaction() {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
}

module.exports = {
  sql,
  connectDB,
  getPool,
  createRequest,
  createTransaction
};
