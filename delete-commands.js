const { REST, Routes } = require('discord.js');
const config = require('./config.json');
require('dotenv').config();

// Construct and prepare the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Delete all commands from the specified guild
(async () => {
    try {
        console.log('Started deleting all application (slash) commands in the guild.');

        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientID, config.guildID),
            { body: [] }, // Empty array removes all commands
        );

        console.log(`Successfully deleted ${data.length} application (slash) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
