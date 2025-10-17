import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

const execute = async (interaction, ctx) => {
    await interaction.reply('Pong!');
};

export default { data, execute };
