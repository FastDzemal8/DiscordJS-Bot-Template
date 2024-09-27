const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    
    /**
     * Executes the slash-based ping command.
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });

        // WebSocket latency
        const wsPing = msg.createdTimestamp - interaction.createdTimestamp;

        // Discord API latency
        const apiPing = client.ws.ping;

        // MongoDB latency
        const mongoStart = Date.now();
        await mongoose.connection.db.admin().ping(); // Test MongoDB latency
        const mongoPing = Date.now() - mongoStart;

        // Create an embed with the latency results
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'WebSocket Latency', value: `\`${wsPing}ms\``, inline: true },
                { name: 'API Latency', value: `\`${apiPing}ms\``, inline: true },
                { name: 'MongoDB Latency', value: `\`${mongoPing}ms\``, inline: true }
            )
            .setTimestamp();

        // Edit the original reply with the embed
        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
