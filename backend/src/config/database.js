const env = require('./env');

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${env.db.server};Database=${env.db.database};Trusted_Connection=Yes;`;

module.exports = {
  connectionString,
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};
