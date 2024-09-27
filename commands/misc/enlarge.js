const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: 'enlarge',
    description: 'Enlarge up to 5 emojis provided by the user.',
    usage: 'enlarge <emoji1> [emoji2] ... [emoji5]',
    cooldown: 5, // Cooldown of 5 seconds
    aliases: ['en'], // Add any aliases if needed

    async execute (message, args, client) {
        const emojis = args.slice(0, 5).map(arg => {
            const match = arg.match(/<a?:(\w+):(\d+)>/);
            if (match) {
                return { name: match[1], id: match[2], animated: arg.startsWith('<a:') };
            }
        }).filter(Boolean);

        if (emojis.length === 0) {
            return message.reply(":x: | No valid emojis provided.");
        }

        let currentPage = 0;

        const createEmbed = () => {
            const emoji = emojis[currentPage];
            const url = emoji.animated 
                ? `https://cdn.discordapp.com/emojis/${emoji.id}.gif`
                : `https://cdn.discordapp.com/emojis/${emoji.id}.png`;

            return new EmbedBuilder()
                .setTitle("Emoji Enlarged")
                .setDescription(`\`${emoji.name}\` **-** \`${emoji.id}\``)
                .setImage(url)
                .setColor('#58b9ff')
                .setFooter({ text: 'Tip: Enlarge up to 5 emotes at once!' });
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === emojis.length - 1)
            );

        const embedMessage = await message.reply({ embeds: [createEmbed()], components: [row] });

        const collector = embedMessage.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'previous') {
                currentPage--;
            } else if (interaction.customId === 'next') {
                currentPage++;
            }

            await interaction.update({
                embeds: [createEmbed()],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Previous')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === emojis.length - 1)
                        )
                ]
            });
        });

        collector.on('end', async () => {
            await embedMessage.edit({ components: [] });
        });
    }
};
