const { REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
require('dotenv').config();

const commands = [];
const slashFolders = fs.readdirSync('./slash');

// Load all slash commands
for (const folder of slashFolders) {
    const slashFiles = fs.readdirSync(`./slash/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const command = require(`./slash/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

// Construct and prepare the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Deploy commands to the specified guild only
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (slash) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientID, config.guildID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (slash) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
