const { Message } = require('discord.js');
const mongoose = require('mongoose');
const config = require('../../config.json');

module.exports = {
    name: 'adminping',
    description: 'Check the bot\'s latency',
    cooldown: 2,
    usage: 'adminping',
    aliases: ['aapong'],
    /**
     * Executes the text-based ping command.
     * @param {Message} message 
     * @param {Array} args 
     * @param {Client} client 
     */
    async execute(message, args, client) {
        const msg = await message.reply('Pinging...');

        // Discord API latency
        const apiPing = `${Math.round(client.ws.ping)}`;

        // WebSocket latency
        const wsPing = msg.createdTimestamp - message.createdTimestamp;

        // MongoDB latency
        const mongoStart = Date.now();
        await mongoose.connection.db.admin().ping(); // Test MongoDB latency
        const mongoPing = Date.now() - mongoStart;

        // Send the results as text
        msg.edit(`🏓 **Pong (Admin)!**\nWebSocket Latency: \`${wsPing}ms\`\nAPI Latency: \`${apiPing}ms\`\nMongoDB Latency: \`${mongoPing}ms\``);
    },
};
