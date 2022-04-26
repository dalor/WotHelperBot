module.exports = (bot, { api, utils }) => {

    bot.command('online', async (ctx) => {
        const user = await ctx.getUser()

        if (!user.access_token) {
            return ctx.reply('Не авторизован')
        }

        const users = await api.getUsersClanOnlineMembers(user.account_id, user.access_token)

        if (!users)
            return

        const clanInfoText = await utils.clanInfoText(user.account_id)
        if (clanInfoText) {
            return ctx.reply(clanInfoText + `\nИгроки онлайн:\n${users.map(
                ({ account_name }) => `- ${account_name}`
            ).join('\n')}`, { parse_mode: 'HTML' })
        }
    })
}