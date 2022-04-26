module.exports = (bot, { api, utils }) => {

    const reservToText = ({
        active,
        name,
        action_time,
        action_last,
        level,
        amount
    }) => `${active ? '🟢 ' : ''}${level} - ${active ? `${Math.round((action_time - action_last) / 60 * 100) / 100} / ` : ''}${action_time / 60} мин [${amount}] - ${name}`

    const clanReserves = async (access_token) => {
        const reserves = await api.clanReserves(access_token)
        if (!reserves)
            return
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

    const text = (preText, reserves) => `${preText}\n\n${reserves.filter(({ active }) => active).map(reservToText).join('\n')}`

    const buttons = (reserves, clan_id) => {
        const activeCount = reserves.filter(({ active }) => active).length
        const reservesButtons = activeCount < 2 ? reserves.filter(({ active }) => !active).map(reserv => ([{
            text: reservToText(reserv),
            callback_data: `activate_reserve ${clan_id} ${reserv.level} ${reserv.type}`
        }])) : []
        return [
            [{
                text: '🔄 Обновить 🔄',
                callback_data: `update_reserves ${clan_id}`
            }],
            ...reservesButtons
        ]
    }

    bot.command('reserves', async (ctx) => {
        const user = await ctx.getUser()
        if (!user.access_token) {
            return ctx.reply('Не авторизован')
        }
        const reserves = await clanReserves(user.access_token)
        if (!reserves)
            return
        const clanInfoText = await utils.clanInfoText(user.account_id)
        const clanId = await api.getClanId(user.account_id)
        if (clanInfoText) {
            return ctx.reply(text(clanInfoText, reserves), {
                reply_markup: {
                    inline_keyboard: buttons(reserves, clanId)
                },
                parse_mode: 'HTML'
            })

        }
    })

    const update = async (ctx, clanId, resultMessage) => {
        const user = await ctx.getUser()
        if (!user.access_token) {
            return ctx.answerCbQuery('Не авторизован')
        }
        const clanData = await api.getUsersClanInfo(user.account_id)
        if (clanData?.clan_id === clanId) {
            const reserves = await clanReserves(user.access_token)
            const clanInfoText = await utils.clanInfoText(user.account_id)
            if (clanInfoText) {
                return ctx.editMessageText(text(clanInfoText, reserves), {
                    reply_markup: {
                        inline_keyboard: buttons(reserves, clanId)
                    },
                    parse_mode: 'HTML'
                }).then(() => ctx.answerCbQuery(resultMessage))
            }
        } else {
            return ctx.answerCbQuery('Не ваш клан')
        }
    }

    bot.action(/activate_reserve (.+) (.+) (.+)/, async (ctx) => {
        const clanId = parseInt(ctx.match[1])
        const reserve_level = ctx.match[2]
        const reserve_type = ctx.match[3]
        const user = await ctx.getUser()
        const activationResult = await api.activateClanReserve(user.access_token, reserve_level, reserve_type)
        console.log(activationResult)
        return update(ctx, clanId, activationResult ? 'OK' : 'Ошибка')
    })

    bot.action(/update_reserves (.+)/, async (ctx) => {
        const clanId = parseInt(ctx.match[1])
        return update(ctx, clanId, 'Обновлено')
    })
}