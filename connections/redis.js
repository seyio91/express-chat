const asyncRedis = require("async-redis");
const { REDIS_HOST, REDIS_PORT } = require('../helpers/keys')
const client = asyncRedis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

module.exports = client