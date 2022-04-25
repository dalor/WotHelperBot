module.exports = (client, { redis, api, siteUrl }) => {

    client.command(/auth (.+)/, async message => {
        const nickname = message.match[1]
        await redis.update(message.user(), { nickname })
        message.channel.send(api.authUrl(`${siteUrl}/auth/${message.user()}`))
    })

    client.command(/prolongate/, async message => {
        const user = await redis.get(message.user())
        if (user && user.access_token) {
            const checked_user = await api.prolongateAuth(user.access_token)
            if (checked_user) {
                await redis.set(message.user(), Object.assign(user, checked_user))
                return message.channel.send('Prolongated')
            }
        }
        return message.channel.send('Error')
    })
}