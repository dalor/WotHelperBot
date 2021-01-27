const { redisUrl } = require('./config')

module.exports = require('./simpleRedis')({ url: redisUrl })