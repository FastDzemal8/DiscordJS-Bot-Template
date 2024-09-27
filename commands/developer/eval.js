const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { inspect } = require("util");
const fs = require('fs');
const path = require('path');
const config = require('../../config.json'); // Make sure to link the config file properly

module.exports = {
    name: 'eval',
    description: 'Evaluate JavaScript code.',
    usage: 'eval {code} --async --depth=x --showhidden --confirm',
    aliases: ['ev'], // Added alias
    /**
     * Execute the eval command.
     * @param {Message} message 
     * @param {Array} args 
     * @param {Client} client 
     */
    async execute(message, args, client) {
        const allowedUserID = config.ownerID; // Make sure `ownerID` is in the config file

        if (message.author.id !== allowedUserID) {
            return message.reply(":x: | You do not have permission to use this command.");
        }

        let code = args.join(" ");

        // Extract options
        const options = {
            async: false,
            depth: 0,
            showhidden: false,
            confirm: false
        };

        // Regex to parse options
        const optionRegex = /--(\w+)(?:=(\w+))?/g;
        let match;
        while ((match = optionRegex.exec(code)) !== null) {
            switch (match[1]) {
                case 'async':
                    options.async = true;
                    break;
                case 'depth':
                    options.depth = parseInt(match[2], 10) || 0;
                    break;
                case 'showhidden':
                    options.showhidden = true;
                    break;
                case 'confirm':
                    options.confirm = true;
                    break;
            }
        }

        // Remove options from code
        code = code.replace(optionRegex, '').trim();

        // Check if the code is inside a code block
        const codeBlockMatch = code.match(/```(?:js)?\s*([\s\S]*)\s*```/);
        if (codeBlockMatch) {
            code = codeBlockMatch[1].trim();
        }

        // If no code provided
        if (!code) {
            return message.reply(":x: | No code provided to evaluate.");
        }

        // Function to execute the code and generate result embed
        const generateResultEmbed = async (result, error) => {
            let resultPreview = result.split('\n').slice(0, 10).join('\n');
            const resultEmbed = new EmbedBuilder()
                .setTitle('Eval Result')
                .setColor(error ? '#FF0000' : '#00FF00') // Red for error, green otherwise
                .setDescription(`\`\`\`js\n${resultPreview}\n\`\`\``);

            let files = [];
            if (result.length > 150) {
                const logFilePath = path.join(__dirname, 'logs.txt');
                try {
                    fs.writeFileSync(logFilePath, result);
                    const attachment = new AttachmentBuilder(logFilePath);
                    resultEmbed.setDescription(`The result is too large to display here. See the attached log file for full details.\n\`\`\`js\n${resultPreview}\n...\n\`\`\``);
                    files = [attachment];
                } catch (error) {
                    console.error("Error writing the log file:", error);
                    resultEmbed.setDescription(`An error occurred while handling the result.`);
                }
            }

            return { embed: resultEmbed, files };
        };

        // Check for confirm option
        if (!options.confirm) {
            const codePreview = code.split('\n').slice(0, 10).join('\n');
            const embed = new EmbedBuilder()
                .setTitle('Eval Command')
                .setDescription(`\`\`\`js\n${codePreview}\n\`\`\`\nAre you sure you want to execute this code?`)
                .setColor('#FFFF00');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('eval_yes')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('eval_no')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Secondary)
                );

            const evalMessage = await message.reply({ embeds: [embed], components: [row], fetchReply: true });

            const filter = i => i.user.id === message.author.id;
            const collector = evalMessage.createMessageComponentCollector({ filter, time: 20000 });

            collector.on('collect', async i => {
                if (i.customId === 'eval_yes') {
                    if (options.async) {
                        code = `(async () => { ${code} })()`;
                    }
                    let result;
                    let error = false;
                    try {
                        result = eval(code);
                        
                        if (typeof result !== 'string') {
                            result = inspect(result, { depth: options.depth, showHidden: options.showhidden });
                        }
                    } catch (err) {
                        result = err.toString();
                        error = true;
                    }

                    const { embed, files } = await generateResultEmbed(result, error);
                    if (result.includes(client.token)) return await i.update({ content: ':x: | The result contains sensitive information and cannot be sent.', components: [], embeds: [] });

                    // Append options used
                    embed.addFields(
                        { name: 'Type', value: `\`\`\`ts\n${typeof result}\n\`\`\``, inline: true },
                        { name: 'Depth', value: `\`\`\`diff\n+ ${options.depth}\n\`\`\``, inline: true },
                        { name: 'Async', value: `\`\`\`diff\n${options.async ? '+ Yes' : '- No'}\n\`\`\``, inline: true },
                        { name: 'Show Hidden', value: `\`\`\`diff\n${options.showhidden ? '+ Yes' : '- No'}\n\`\`\``, inline: true },
                        { name: 'Error', value: `\`\`\`diff\n${error ? '+ Yes' : '- No'}\n\`\`\``, inline: true }
                    );

                    await i.update({ embeds: [embed], files, components: [] });
                } else if (i.customId === 'eval_no') {
                    await i.update({ content: 'Action canceled.', components: [], embeds: [] });
                }
            });

            collector.on('end', collected => {
                if (!collected.size) {
                    evalMessage.edit({ content: 'No action taken.', components: [], embeds: [] });
                }
            });

        } else {
            // Direct execution without confirmation
            if (options.async) {
                code = `(async () => { ${code} })()`;
            }
            let result;
            let error = false;
            try {
                result = eval(code);
                
                if (typeof result !== 'string') {
                    result = inspect(result, { depth: options.depth, showHidden: options.showhidden });
                }
            } catch (err) {
                result = err.toString();
                error = true;
            }

            const { embed, files } = await generateResultEmbed(result, error);
            if (result.includes(client.token)) return message.reply(":x: | The result contains sensitive information and cannot be sent.");

            // Append options used
            embed.addFields(
                { name: 'Type', value: `\`\`\`ts\n${typeof result}\n\`\`\``, inline: true },
                { name: 'Depth', value: `\`\`\`diff\n+ ${options.depth}\n\`\`\``, inline: true },
                { name: 'Async', value: `\`\`\`diff\n${options.async ? '+ Yes' : '- No'}\n\`\`\``, inline: true },
                { name: 'Show Hidden', value: `\`\`\`diff\n${options.showhidden ? '+ Yes' : '- No'}\n\`\`\``, inline: true },
                { name: 'Error', value: `\`\`\`diff\n${error ? '+ Yes' : '- No'}\n\`\`\``, inline: true }
            );

            await message.reply({ embeds: [embed], files });
        }
    }
};
