import { CommandInteraction, SlashCommandBuilder, type Interaction } from "discord.js";
import type { Ctx } from "../context.js";

const data = new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Add, list, or cancel reminders.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a reminder')
            .addStringOption((option) =>
                option
                    .setName('time')
                    .setDescription('When to run the reminder.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('msg')
                    .setDescription('Reminder message.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) => 
        subcommand
            .setName('list')
            .setDescription('List all reminders for me.')
    )
    .addSubcommand((subcommand) => 
        subcommand
            .setName('cancel')
            .setDescription('Cancel a reminder.')
            .addIntegerOption((option) =>
                option
                    .setName('index')
                    .setDescription('Reminder index in list')
                    .setRequired(true)
            )
    );

const execute = async (interaction: CommandInteraction, ctx: Ctx) => {
    await interaction.reply({ content: 'Registering reminder...' });
};

export default { data, execute };
