import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from "discord.js";
import type { Ctx } from "../context.js";

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong');

const execute = async (interaction: ChatInputCommandInteraction, ctx: Ctx) => {
    await interaction.reply({
        content: 'Pong!',
        flags: MessageFlags.Ephemeral
    });
};

const start = async (ctx: Ctx) => {};

export default { data, execute, start };
