module.exports = (client, { redis, api }) => {

    client.command(/tanks ?([0-9]{1,2})/, async message => {
        const user = await redis.get(message.user())
        if (user) {
            const { account_id, access_token } = user
            const tanks = await api.getUsersTanksInHangar(account_id, access_token, { tier: message.match[1] })
            message.channel.send(tanks.map(({ name }) => name).join('\n'))
        }
    })
}