module.exports = (api) => {

    return {
        clanInfoText: async (account_id) => {
            const clanData = await api.getUsersClanInfo(account_id)
            if (clanData) {
                const { tag, name, motto } = clanData
                return `<b>[${tag}]</b> ${name}\n<i>${motto}</i>`
            }
        }

    }
}