module.exports = (client, { redis, api }) => {

    client.command(/online/, async message => {
        const user = await redis.get(message.user())
        if (user) {
            const { account_id, access_token } = user
            console.log(access_token)
            const online_members = await api.getUsersClanOnlineMembers(account_id, access_token)
            message.channel.send(online_members.map(({ account_name }) => account_name).join('\n'))
        }
    })
}