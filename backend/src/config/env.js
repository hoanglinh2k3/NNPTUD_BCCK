const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'decor_shop_dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadBaseUrl: process.env.UPLOAD_BASE_URL || 'http://localhost:5000/uploads',
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD || 5),
  db: {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_DATABASE || 'DecorShopDB'
  }
};
