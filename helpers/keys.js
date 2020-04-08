require('dotenv').config()
DB_HOST = process.env.DB_HOST;
DB_PORT = process.env.DB_PORT;
module.exports = {
    DB_HOST,
    DB_PORT,
    DBCONN: `${DB_HOST}:${DB_PORT}`,
    TEST: process.env.TEST
  };