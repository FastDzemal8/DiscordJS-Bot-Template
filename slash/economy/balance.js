const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Candy = require('../../storage/schemas/candy');
const Berry = require('../../storage/schemas/berry');
const Pixie = require('../../storage/schemas/pixie');
const Starlight = require('../../storage/schemas/starlight');
const currencies = require('../../currency.json');
const emotes = require('../../emotes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check the balance of a user for all currencies.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check the balance for')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        let user = interaction.options.getUser('user') || interaction.member.user;

        // Fetch member from server
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.editReply('The user is not in this server.');
        }

        // Check if the user exists in the database
        let candy = await Candy.findOne({ userID: user.id }) || await Candy.create({ userID: user.id, balance: 0 });
        let berry = await Berry.findOne({ userID: user.id }) || await Berry.create({ userID: user.id, balance: 0 });
        let pixie = await Pixie.findOne({ userID: user.id }) || await Pixie.create({ userID: user.id, balance: 0 });
        let starlight = await Starlight.findOne({ userID: user.id }) || await Starlight.create({ userID: user.id, balance: 0 });

        // Create a response embed
        const embed = new EmbedBuilder()
            .setTitle('♡ balance')
            .setDescription(`_ _\n_ _　${emotes.pinkstar} 　 ｡　˚ *star* 　 𝜗𝜚 　 *balance*　\n_ _\n_ _　${currencies.berry}　**berry**　:　${berry.blacklisted ? 'Blacklisted' : berry.balance.toLocaleString('en-US')}\n_ _　${currencies.pixie}　**pixie**　:　${pixie.blacklisted ? 'Blacklisted' : pixie.balance.toLocaleString('en-US')}\n_ _　${currencies.candy}　**candy**　:　${candy.blacklisted ? 'Blacklisted' : candy.balance.toLocaleString('en-US')}\n_ _　${currencies.starlight}　**starlight**　:　${starlight.blacklisted ? 'Blacklisted' : starlight.balance.toLocaleString('en-US')}\n_ _\n_ _　　　　　　　　　　　♡***${user.username}***　${emotes.starred}\n_ _\n_ _`)
            .setColor(16758758);

        await interaction.editReply({ embeds: [embed] });
    },
};
