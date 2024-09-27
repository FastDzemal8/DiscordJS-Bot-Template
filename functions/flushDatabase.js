const Berry = require('../storage/schemas/berry');
const Pixie = require('../storage/schemas/pixie');
const Candy = require('../storage/schemas/candy');
const Starlight = require('../storage/schemas/starlight');
const currenciez = ['berry', 'pixie', 'candy', 'starlight'];
const emotes = require('../emotes.json');
const currencies = require('../currency.json');
const { EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = async function flushDatabase(client, type = 'all') {
    // Helper function to flush a specific collection
    async function flushCollection(model, name) {
        try {
            await model.deleteMany({});
            console.log(`${name} database flushed successfully.`);
        } catch (err) {
            console.error(`Failed to flush ${name} database: ${err.message}`);
        }
    }

    // Determine which databases to flush
    if (type === 'all') {
        await flushCollection(Berry, 'Berry');
        await flushCollection(Pixie, 'Pixie');
        await flushCollection(Candy, 'Candy');
        await flushCollection(Starlight, 'Starlight');
        console.log('All databases have been flushed.');
    } else {
        switch (type.toLowerCase()) {
            case 'berry':
                await flushCollection(Berry, 'Berry');
                break;
            case 'pixie':
                await flushCollection(Pixie, 'Pixie');
                break;
            case 'candy':
                await flushCollection(Candy, 'Candy');
                break;
            case 'starlight':
                await flushCollection(Starlight, 'Starlight');
                break;
            default:
                console.log(`Invalid currency type: ${type}. Please specify one of the following: ${currenciez.join(', ')}`);
        }
    }

    // Send a notification to a specific channel (optional)
    /*
    const logChannelId = '1282465564325052456'; // Replace with your actual channel ID
    const logChannel = client.channels.cache.get(logChannelId);
    */
    const webhookUrl = 'https://discord.com/api/webhooks/1284896771603955764/53OCOBb60WQ9YZSqyolp2MYgu_jBIEmD37EcgmXlyWFT3oUGnw93X4czosqSPCdyr0ws';
    const hook = new WebhookClient({ url: webhookUrl });

    if (hook) {
        const embed = new EmbedBuilder()
            .setTitle('Database Flush')
            .setDescription(type === 'all' ? 'All databases have been flushed.' : `The ${type} database has been flushed.`)
            .setColor(0xff0000);
        
        hook.send({ embeds: [embed] });
    }
};
