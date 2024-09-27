const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const config = require('./config.json');

// Initialize Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Initialize command collections
client.commands = new Collection();
client.slashCommands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Map();

// Load message-based commands
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
        if (command.aliases) {
            command.aliases.forEach(alias => client.aliases.set(alias, command.name));
        }
    }
}

// Load slash commands
const slashFolders = fs.readdirSync('./slash');
for (const folder of slashFolders) {
    const slashFiles = fs.readdirSync(`./slash/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const slashCommand = require(`./slash/${folder}/${file}`);
        client.slashCommands.set(slashCommand.data.name, slashCommand);
    }
}

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { /*
    useNewUrlParser: true,
    useUnifiedTopology: true,
    */
}).then(() => {
    console.log('[ DB ] Connected to MongoDB');
}).catch((err) => {
    console.error('[ DB ] Failed to connect to MongoDB:', err);
});

const db = mongoose.connection;
client.db = db;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Optionally: log the error to a file or monitoring service
    // Optionally: perform a graceful shutdown
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally: log the error to a file or monitoring service
    // Optionally: perform a graceful shutdown
});


client.login(process.env.TOKEN);
