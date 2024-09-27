const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const emotes = require('../../emotes.json');

module.exports = {
    name: 'pull',
    description: 'Pull changes from GitHub and restart the bot',
    usage: 'pull',
    cooldown: 20,
    async execute(message, args, client) {
        // Ensure only the owner can use this command
        const allowedUserID = config.ownerID || '839516926098931712';

        if (message.author.id !== allowedUserID) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('RED')
                        .setTitle(':x: Unauthorized')
                        .setDescription('You do not have permission to use this command.')
                ]
            });
        }

        // Confirmation buttons
        const confirm = new ButtonBuilder()
            .setCustomId('confirm_p')
            .setLabel('Confirm')
            .setEmoji(emotes.check)
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId('cancel_p')
            .setLabel('Cancel')
            .setEmoji(emotes.cross)
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        // Confirmation embed
        const fembed = new EmbedBuilder()
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .setColor('#fcf003')
            .setTitle('⚠️ Pull Changes from GitHub')
            .setDescription(
                'This command is intended for production environments and requires the bot to be running via `pm2`.\n\n' +
                'Are you sure you want to continue?'
            )
            .setFooter({ text: 'This confirmation will expire in 20 seconds.' });

        // Send confirmation message
        const msg = await message.reply({ embeds: [fembed], components: [row], fetchReply: true });

        // Button interaction collector
        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 20000 });

        collector.on('collect', async i => {
            if (i.customId === 'cancel_p') {
                await i.update({
                    content: 'Action canceled.',
                    components: [],
                    embeds: []
                });
            } else if (i.customId === 'confirm_p') {
                await i.update({
                    content: 'Pulling changes...',
                    components: [],
                    embeds: []
                });

                try {
                    // Execute Git pull command
                    const pullOutput = execSync('GIT_SSH_COMMAND="ssh -o IdentitiesOnly=yes" git pull', { encoding: 'utf-8' });
                    console.log('Pull Output:', pullOutput);

                    // Save pull log to a file
                    const pullFilePath = path.join(__dirname, 'pull-log.txt');
                    fs.writeFileSync(pullFilePath, pullOutput);

                    if (pullOutput.includes('Already up to date.')) {
                        return message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#4257f5')
                                    .setDescription('🚀 The bot is already up to date.')
                            ]
                        });
                    }

                    // Respond with success message and attach pull log
                    await message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({
                                    name: message.author.tag,
                                    iconURL: message.author.displayAvatarURL()
                                })
                                .setColor('#0af761')
                                .setTitle('📥 | Pull Successful!')
                                .setDescription('Changes pulled successfully. A log file has been attached.')
                                .setTimestamp()
                        ],
                        files: [
                            new AttachmentBuilder(pullFilePath)
                        ]
                    });

                    // Restart the bot via pm2
                    execSync(`pm2 restart 4`);
                } catch (error) {
                    console.error('Error during pull or restart:', error);
                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#fc030f')
                                .setTitle('❌ Error')
                                .setDescription('An error occurred while pulling changes or restarting the bot.')
                        ]
                    });
                }
            }
        });

        // Handle timeout for button collector
        collector.on('end', collected => {
            if (!collected.size) {
                msg.edit({
                    content: 'No action taken within the time limit.',
                    components: [],
                    embeds: []
                });
            }
        });
    }
};
