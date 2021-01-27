const { application_id } = require('../config')
const api = require('../methods')(application_id)

const redis = require('../redis')

const fastify = require('fastify')({
    logger: true
})

fastify.get('/auth/:user_id', async (request, reply) => {
    const { access_token } = request.query
    const user_id = request.params.user_id
    const checked_user = await api.prolongateAuth(access_token)
    if (checked_user) {
        const nickname = await api.getNickname(checked_user.account_id)
        const user = await redis.get(user_id)
        if (nickname === user.nickname) {
            await redis.set(user_id, Object.assign(user, checked_user))
            return { ok: true }
        }
    }
    return { ok: false }
})


module.exports = async () => fastify.listen(process.env.PORT || 8080,
    (err, address) => {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        }
        fastify.log.info(`server listening on ${address}`)
    })