module.exports = (client, { prefix }) => {

    const commands = []

    const checker = (comm, text, message) => {
        const match = text.match(comm.regex)
        if (match) {
            message.match = match
            message.user = () => `user:${message.author.id}`
            return comm.callback(message)
        }
    }

    client.on('message', async (message) => {
        if (message.content.startsWith(prefix) && !message.author.bot) {
            const text = message.content.replace(prefix, '')
            return Promise.all(commands.map((comm) => checker(comm, text, message)).filter(c => c))
        }
    })

    client.command = (comm, callback) => {
        commands.push({ regex: comm, callback })
    }

}