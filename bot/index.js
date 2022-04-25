const Discord = require('discord.js');
const config = require('../config');
const fs = require('fs')
const methods = require('../methods')
const redis = require('../redis')

const client = new Discord.Client();

require('./command')(client, { prefix: config.prefix })

client.once('ready', () => {
    console.log('Ready!');
});

const modulesFiles = fs.readdirSync('./bot/modules').filter(file => file.endsWith('.js'));

const newConfig = {
    ...config,
    api: methods(config.application_id),
    redis
}

for (const file of modulesFiles) {
    const module = require(`./modules/${file}`)
    if (typeof module === 'function') {
        module(client, newConfig)
    }
}

module.exports = async () => config.token && await client.login(config.token)
