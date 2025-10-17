import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Ctx } from "../context.js";

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

const execute = async (interaction: CommandInteraction, ctx: Ctx) => {
    await interaction.reply('Pong!');
};

export default { data, execute };
