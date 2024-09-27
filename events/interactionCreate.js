module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                const command = client.slashCommands.get(interaction.commandName);

                if (!command) {
                    await interaction.reply({ content: 'Command not found', ephemeral: true });
                    return;
                }

                await command.execute(interaction, client);
            } else if (interaction.isModalSubmit()) {
                const modalHandler = client.modals.get(interaction.customId);

                if (!modalHandler) {
                    await interaction.reply({ content: 'Modal handler not found', ephemeral: true });
                    return;
                }

                await modalHandler.execute(interaction, client);
            } else {
                return;
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content: 'There was an error while processing the interaction!',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while processing the interaction!',
                    ephemeral: true,
                });
            }
        }
    },
};
