const querystring = require('querystring');

const fetch = require('node-fetch');

const url = 'https://api.worldoftanks.ru/wot'

const get = (path, data) => fetch(method(path, data))
    .then(res => res.json())

const post = (path, data) => fetch(url + path + '/', { method: 'POST', body: querystring.stringify(data) })
    .then(res => res.json())

const method = (path, data) => url + path + '/?' + querystring.stringify(data)

const authUrl = (data) => method('/auth/login', data)

const prolongateAuth = (data) => post('/auth/prolongate', data)

const tanksStats = (data) => get('/tanks/stats', data)

const vehicles = (data) => get('/encyclopedia/vehicles', data)

const accountInfo = (data) => get('/account/info', data)

const clanInfo = (data) => get('/clans/info', data)

const clanReserves = (data) => get('/stronghold/clanreserves', data)

const activateClanReserve = (data) => post('/stronghold/activateclanreserve', data)

module.exports = (application_id) => {

    const getClanId = (account_id) => accountInfo({
        application_id,
        account_id,
        fields: 'clan_id'
    }).then((data) => data.data && data.data[account_id].clan_id)

    const getOnlineMembers = (clan_id, access_token) => clanInfo({
        application_id,
        clan_id,
        access_token,
        extra: 'private.online_members',
        fields: ['members_count', 'members', 'private.online_members'].join(',')
    }).then((data) => data.data && data.data[clan_id]).then(({ members, private }) => members.filter(member => private.online_members.includes(member.account_id)))

    const getTanksInHangar = (account_id, access_token) => tanksStats({
        application_id,
        account_id,
        access_token,
        in_garage: '1',
        fields: 'tank_id'
    }).then((data) => data.data && data.data[account_id].map(t => t.tank_id))

    const getVehicles = ({ tier, type, tank_id }) =>
        vehicles({
            application_id,
            fields: 'name,nation,is_premium,tank_id,tier,type,short_name',
            tier,
            type,
            tank_id: tank_id ? tank_id.join(',') : undefined
        }).then((data) => data.data && Object.values(data.data))

    return {

        authUrl: (redirect_uri) => authUrl({
            application_id,
            redirect_uri
        }),

        prolongateAuth: (access_token) => prolongateAuth({
            application_id,
            access_token
        }).then(data => data.data),

        getVehicles,

        getTanksInHangar,

        getUsersTanksInHangar: (account_id, access_token, data) =>
            getTanksInHangar(account_id, access_token).then(tank_id =>
                getVehicles(Object.assign(data, { tank_id: tank_id.slice(0, 100) }))).then(tanks => tanks.filter(t => t)),

        getNickname: (account_id) => accountInfo({
            application_id,
            account_id,
            fields: 'nickname'
        }).then((data) => data.data && data.data[account_id].nickname),

        getClanId,

        getOnlineMembers,

        getUsersClanOnlineMembers: (account_id, access_token) => getClanId(account_id).then(clan_id => getOnlineMembers(clan_id, access_token)),

        activateClanReserve: (access_token, reserve_level, reserve_type) => activateClanReserve({
            application_id,
            access_token,
            reserve_level,
            reserve_type
        }).then(data => data.data),

        clanReserves: (access_token) => clanReserves({
            application_id,
            access_token
        }).then(data => data.data),

        clanInfo: (clan_id) => clanInfo({
            application_id,
            clan_id
        }).then(data => data.data?.[clan_id]),

    }
}
