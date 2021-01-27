const redis = require('redis')

module.exports = (opts) => {
    const client = redis.createClient(opts);

    client.on("error", console.error)

    const get = (key) => new Promise((resolve, reject) => client.get(key, (err, val) => {
        if (err) reject(err)
        else resolve(JSON.parse(val))
    }))

    const set = (key, val) => new Promise((resolve, reject) => client.set(key, JSON.stringify(val), (err) => {
        if (err) reject(err)
        else resolve()
    }))

    return {
        set,
        get,
        update: (key, val) => get(key).then((value) => set(key, Object.assign(value || {}, val)))
    }

}