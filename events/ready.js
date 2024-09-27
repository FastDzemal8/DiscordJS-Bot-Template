module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.tag} is now online!`);

        // Set the bot's presence
        client.user.setPresence({
            status: 'idle',
            activities: [{
                name: 'with Stars'/*,
                type: 'PLAYING',*/
            }],
        });

        console.log('Bot status set to idle and PLAYING with Stars');

        client.threshold = Math.floor(Math.random() * (670 - 350 + 1)) + 350;
        console.log(`Threshold set to: ${client.threshold}`);
    },
};
