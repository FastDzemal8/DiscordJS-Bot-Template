const config = require('../config.json');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const prefix = config.prefix;

        // Check if the message starts with the bot mention
        if (message.content.startsWith(`<@${client.user.id}>`)) {
            return message.reply(`Hi, my prefix is \`${prefix}\``);
        }

        if (message.content === prefix) return;

        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
    
            const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    
            if (!command || typeof command.execute !== 'function') {
                console.log('Invalid command or missing execute function:', command);
                return;
            }
            
            // Skip cooldown handling for a specific command if there is a separate system implemented within it
            if (command.name === 'witch'/* || command.name === 'magic'*/) {
                return command.execute(message, args, client);
            }
    
            const { cooldowns } = client;
    
            // If the command has no cooldown, default to 3 seconds
            const cooldownAmount = (command.cooldown || 3) * 1000;
    
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Map());
            }
    
            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownTimestamp = timestamps.get(message.author.id);
    
            if (cooldownTimestamp && now < cooldownTimestamp) {
                const timeLeft = (cooldownTimestamp - now) / 1000;
    
                const days = Math.floor(timeLeft / 86400);
                const hours = Math.floor((timeLeft % 86400) / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = Math.floor(timeLeft % 60);
                
                let timeString = '';
                if (days > 0) timeString += `${days} day${days !== 1 ? 's' : ''}, `;
                if (hours > 0) timeString += `${hours} hour${hours !== 1 ? 's' : ''}, `;
                if (minutes > 0) timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}, `;
                timeString += `${seconds} second${seconds !== 1 ? 's' : ''}`;
                
                if (command.cooldown_msg) {
                    return message.reply(`${command.cooldown_msg} **${timeString}**`);
                } else {
                    return message.reply(`Please wait **${timeString}** before reusing the \`${command.name}\` command.`);
                }
            }
    
            timestamps.set(message.author.id, now + cooldownAmount);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    
            try {
                await command.execute(message, args, client);
            } catch (error) {
                console.error(error);
                message.reply('There was an error executing the command!');
            }
        }
    },
};
