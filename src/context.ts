import type { Client, CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { Keyv } from 'keyv';

type Ctx = {
    discordClient: Client,
    keyv: Keyv,
};

type Command = {
    data: SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: CommandInteraction, ctx: Ctx) => Promise<void>,
}

export type { Ctx, Command };
