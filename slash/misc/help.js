const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

// Get all text command categories
const getTextCommandCategories = () => {
    const categories = {};
    const commandFolders = fs.readdirSync(path.join(__dirname, '../../commands'));

    for (const folder of commandFolders) {
        const folderPath = path.join(__dirname, `../../commands/${folder}`);
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        categories[folder] = files.map(file => file.replace('.js', ''));
    }

    return categories;
};

// Get all slash command categories
const getSlashCommandCategories = () => {
    const categories = {};
    const commandFolders = fs.readdirSync(path.join(__dirname, '../../slash'));

    for (const folder of commandFolders) {
        const folderPath = path.join(__dirname, `../../slash/${folder}`);
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        categories[folder] = files.map(file => file.replace('.js', ''));
    }

    return categories;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to get more information about')
                .setRequired(false)),
    
    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const categories = getTextCommandCategories();
        const slashCategories = getSlashCommandCategories();
        const slashCommands = Array.from(interaction.client.slashCommands.values());

        if (commandName) {
            // Specific command information
            const command = interaction.client.commands.get(commandName) || interaction.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            if (command) {
                let usage;
                if (command.usage) {
                    usage = `${config.prefix}${command.usage}`;
                } else {
                    usage = 'No usage information available.';
                }
                let cooldown;
                if (command.cooldown) {
                    const c_time = command.cooldown;

                    const days = Math.floor(c_time / 86400);
                    const hours = Math.floor((c_time % 86400) / 3600);
                    const minutes = Math.floor((c_time % 3600) / 60);
                    const seconds = Math.floor(c_time % 60);
                    
                    let timeString = '';
                    if (days > 0) timeString += `${days} day${days !== 1 ? 's' : ''}, `;
                    if (hours > 0) timeString += `${hours} hour${hours !== 1 ? 's' : ''}, `;
                    if (minutes > 0) timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}, `;
                    timeString += `${seconds} second${seconds !== 1 ? 's' : ''}`;
                    cooldown = timeString;
                } else {
                    cooldown = 'No cooldown';
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Help: \`${command.name}\``)
                    .setDescription(`**Description:** ${command.description || 'No description available.'}\n\n**Usage:** \`${usage/* || 'No usage information available.'*/}\`\n\n**Aliases:** ${command.aliases ? command.aliases.map(alias => `\`${alias}\``).join(', ') : 'None'}\n**Cooldown:** ${cooldown/* || 'No cooldown'*/}`)
                    .setColor(16758758);

                return interaction.reply({ embeds: [embed] });
            } else {
                return interaction.reply('Command not found.');
            }
        }
        
        // Pagination embeds
        let currentPage = 0;
        const pages = [
            // Page 1: Text Commands
            new EmbedBuilder()
                .setTitle('Text Commands')
                .setThumbnail(interaction.client.user.displayAvatarURL()) // Set thumbnail as client avatar
                .setDescription(Object.entries(categories).map(([category, commands]) => `**${category.charAt(0).toUpperCase() + category.slice(1)}**\n${commands.map(cmd => `\`${cmd}\``).join(', ')}`).join('\n\n'))
                .setColor(16758758),
            // Page 2: Slash Commands
            new EmbedBuilder()
                .setTitle('Slash Commands')
                .setThumbnail(interaction.client.user.displayAvatarURL()) // Set thumbnail as client avatar
                .setDescription(Object.entries(slashCategories).map(([category, commands]) => `**${category.charAt(0).toUpperCase() + category.slice(1)}**\n${commands.map(cmd => `\`/${cmd}\``).join(', ')}`).join('\n\n'))
                .setColor(16758758)
        ];

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await interaction.reply({ embeds: [pages[currentPage]], components: [row], fetchReply: true });

        const filter = i => i.customId === 'prev' || i.customId === 'next';
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'next') {
                currentPage = (currentPage + 1) % pages.length;
            } else if (i.customId === 'prev') {
                currentPage = (currentPage - 1 + pages.length) % pages.length;
            }

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === pages.length - 1);

            await i.update({ embeds: [pages[currentPage]], components: [row] });
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
            message.edit({ components: [row] });
        });
    },
};
