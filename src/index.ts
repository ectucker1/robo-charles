import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { Keyv } from 'keyv';
import { KeyvSqlite } from '@keyv/sqlite';
import type { Ctx, Command } from './context.js';

import { default as commands } from './commands.js';

import { default as dotenv } from 'dotenv';
dotenv.config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds ]});

const keyv = new Keyv(new KeyvSqlite('sqlite://data.sqlite'));

const ctx = {
    discordClient,
    keyv
};

discordClient.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready! Logged in as ${readyClient.user.tag}`);
});

const commandMap = new Collection<string, Command>();
for (const command of commands) {
    commandMap.set(command.data.name, command);
}

discordClient.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = commandMap.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, ctx);
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

await discordClient.login(process.env.DISCORD_TOKEN);

for (const command of commands) {
    await command.start(ctx);
}
