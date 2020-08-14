require('dotenv').config()
DB_HOST = process.env.DB_HOST || 'http://localhost';
DB_PORT = process.env.DB_PORT || 3000;
REDIS_HOST = process.env.REDIS_HOST || 'localhost';
REDIS_PORT = process.env.REDIS_PORT || '6379';
module.exports = {
    DB_HOST,
    DB_PORT,
    DBCONN: `${DB_HOST}:${DB_PORT}`,
    REDIS_HOST,
    REDIS_PORT
  };