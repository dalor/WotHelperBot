const fetch = require('node-fetch');
const querystring = require('querystring');

const clanInfoMembers = ({ application_id, clan_id, access_token }) => fetch('https://api.worldoftanks.ru/wgn/clans/info/?' + querystring.stringify(
    {
        application_id,
        clan_id,
        access_token,
        extra: 'private.online_members',
        fields: ['members_count', 'members', 'private.online_members'].join(',')
    }))
    .then(res => res.json())

const checkOnlineInterval = ({ application_id, clan_id, access_token, interval, callback }) => setInterval(() => {
    clanInfoMembers({ application_id, clan_id, access_token }).then(json => {
        if (json.status === 'ok') {
            const data = json.data[clan_id]
            if (data) {
                callback(data.members.filter(member => data.private.online_members.includes(member.account_id)))
            }
        }
    }).catch(() => console.log(`Can\`t get information of ${clan_id} clan`))
}, interval)

const checkOnline = ({ application_id, clan_id, access_token, interval, callback }) => {
    let firstTime = true
    const online_members = []
    const replaceMembers = (newMembers) => {
        online_members.splice(0, online_members.length)
        online_members.push(...newMembers)
    }
    const resInterval = checkOnlineInterval({
        application_id, clan_id, access_token, interval,
        callback: (members) => {
            if (!firstTime) {
                const joined = members.filter(member => !online_members.find(mem => mem.account_id === member.account_id))
                const leaved = online_members.filter(member => !members.find(mem => mem.account_id === member.account_id))
                replaceMembers(members)
                if (joined.length || leaved.length) callback(joined, leaved, members)
            } else {
                firstTime = false
                replaceMembers(members)
            }
        }
    })
    resInterval.online = online_members
    return resInterval
}

module.exports = checkOnline
