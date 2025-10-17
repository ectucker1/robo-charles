import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';

import { default as commands } from './commands.mjs';

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds ]});

discordClient.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready! Logged in as ${readyClient.user.tag}`);
});

discordClient.commands = new Collection();
for (const command of commands) {
    discordClient.commands.set(command.data.name, command);
}

discordClient.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error('No command matching ${interaction.commandName} was found.');
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
    }
});

discordClient.login(process.env.DISCORD_TOKEN);
