module.exports = (bot, { api, siteUrl }) => {

    bot.hears(/\/auth (.+)/, async (ctx) => {
        const nickname = ctx.match[1]
        await ctx.updateUser({ nickname })
        return ctx.reply(api.authUrl(`${siteUrl}/auth/${ctx.user()}`))
    })

    bot.command('auth', async (ctx) => {
        return ctx.reply('Введите команду /auth <code>никнейм</code>', { parse_mode: 'HTML' })
    })

    bot.command('prolongate', async (ctx) => {
        const user = await ctx.getUser()
        if (user && user.access_token) {
            const checked_user = await api.prolongateAuth(user.access_token)
            if (checked_user) {
                await ctx.updateUser(checked_user)
                return ctx.reply('Продлено')
            }
        }
        return ctx.reply('Ошибка')
    })
}