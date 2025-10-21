import type { ChatInputCommandInteraction, Client, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { Keyv } from 'keyv';

type Ctx = {
    discordClient: Client,
    keyv: Keyv,
};

type Command = {
    data: SlashCommandSubcommandsOnlyBuilder,
    start: (ctx: Ctx) => Promise<void>,
    execute: (interaction: ChatInputCommandInteraction, ctx: Ctx) => Promise<void>,
}

export type { Ctx, Command };
