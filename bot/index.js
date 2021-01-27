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

config.api = methods(config.application_id)
config.redis = redis

const modulesFiles = fs.readdirSync('./bot/modules').filter(file => file.endsWith('.js'));

for (const file of modulesFiles) {
    const module = require(`./modules/${file}`)
    if (typeof module === 'function') {
        module(client, config)
    }
}

module.exports = async () => await client.login(config.token)
