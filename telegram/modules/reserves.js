


module.exports = (bot, { api }) => {

    const clanReserves = async (access_token) => {
        const reserves = await api.clanReserves(access_token)
        const now_time = Date.now() / 1000
        return reserves.map(({ name, bonus_type, in_stock, type }) =>
            in_stock.map(({ status, action_time, active_till, level, amount }) => (status && action_time && {
                active: status === 'active',
                name: `${name} ${bonus_type}`,
                action_time,
                action_last: active_till ? Math.round(active_till - now_time) : null,
                level,
                type,
                amount
            })).filter(x => x)
        ).filter(x => x?.length).reduce((prev, curr) => [...prev, ...curr], [])
    }

    bot.command('reserves', async (ctx) => {
        const user = await ctx.getUser()
        if (!user.access_token) {
            return ctx.reply('Не авторизован')
        }

        const reserves = await clanReserves(user.access_token)

        const clanData = await api.getClanId(user.account_id).then(api.clanInfo)
        if (clanData) {
            const { tag, name, motto } = clanData
            return ctx.reply(`<b>[${tag}]</b> ${name}\n<i>${motto}</i>`, {
                reply_markup: {
                    inline_keyboard: reserves.map(({
                        active,
                        name,
                        action_time,
                        action_last,
                        level,
                        type,
                        amount
                    }) => ([{
                        text: `${active ? '🟢 ' : ''}${level} - ${active ? `${Math.round((action_time - action_last) / 60 * 100) / 100} / ` : ''}${action_time / 60} мин [${amount}] - ${name}`,
                        callback_data: `activate_reserve ${level} ${type}`
                    }]))
                },
                parse_mode: 'HTML'
            })

        }
    })

    bot.action(/activate_reserve (.+) (.+)/, async (ctx) => {
        const reserve_level = ctx.match[1]
        const reserve_type = ctx.match[2]
        const user = await ctx.getUser()
        const activationResult = await api.activateClanReserve(user.access_token, reserve_level, reserve_type)
        return ctx.answerCbQuery(activationResult ? 'OK' : 'Error')
    })
}