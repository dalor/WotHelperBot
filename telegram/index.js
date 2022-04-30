const { Telegraf } = require('telegraf')
const telegrafPlugin = require('fastify-telegraf')
const fs = require('fs')

const config = require('../config');

const methods = require('../methods')
const redis = require('../redis')

const utils = require('./utils')

const bot = new Telegraf(config.telegramToken)

bot.use(async (ctx, next) => {
    const ctxData = { loaded: false }
    const user = () => `telegram:${ctx.from.id}`
    const setUser = async (data) => {
        delete data.loaded
        return await redis.set(user(), data)
    }
    const getUser = () => redis.get(user()).then((data) => {
        if (data) {
            Object.assign(ctxData, {
                ...data,
                loaded: true
            })
        }
        return ctxData
    })
    const updateUser = async (data) => {
        if (!ctxData.loaded) {
            await redis.get(user())
        }
        return await setUser({ ...ctxData, ...data })
    }
    Object.assign(ctx, {
        data: ctxData,
        user,
        getUser,
        setUser,
        updateUser
    })
    await next()
})

const modulesFiles = fs.readdirSync('./telegram/modules').filter(file => file.endsWith('.js'));

const api = methods(config.application_id)

const newConfig = {
    ...config,
    api,
    redis,
    utils: utils(api)
}

for (const file of modulesFiles) {
    const module = require(`./modules/${file}`)
    if (typeof module === 'function') {
        module(bot, newConfig)
    }
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

bot.catch(console.error)

module.exports = {
    bot,
    registerFastifyWebhook: (fastify) => {
        if (config.telegramToken) {
            fastify.register(telegrafPlugin, { bot, path: '/' + config.telegramToken })
            bot.telegram.setWebhook(config.siteUrl + '/' + config.telegramToken)
        }
    }
}