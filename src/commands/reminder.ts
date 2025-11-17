import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from "discord.js";
import type { Ctx } from "../context.js";
import { Keyv } from "keyv";
import { default as later } from "@breejs/later";

const SUBCOMMAND_HELP = 'help';
const SUBCOMMAND_ADD = 'add';
const SUBCOMMAND_LIST = 'list';
const SUBCOMMAND_CANCEL = 'cancel';

const OPTION_TIME = 'time';
const OPTION_MESSAGE = 'message';

const OPTION_INDEX = 'index';

const data = new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Add, list, or cancel reminders')
    .addSubcommand((subcommand) => 
        subcommand
            .setName(SUBCOMMAND_HELP)
            .setDescription('Get help with reminders')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName(SUBCOMMAND_ADD)
            .setDescription('Add a reminder')
            .addStringOption((option) =>
                option
                    .setName(OPTION_TIME)
                    .setDescription('When to run the reminder')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName(OPTION_MESSAGE)
                    .setDescription('Reminder message')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) => 
        subcommand
            .setName(SUBCOMMAND_LIST)
            .setDescription('List all reminders for me')
    )
    .addSubcommand((subcommand) => 
        subcommand
            .setName(SUBCOMMAND_CANCEL)
            .setDescription('Cancel a reminder')
            .addIntegerOption((option) =>
                option
                    .setName(OPTION_INDEX)
                    .setDescription('Reminder index in list')
                    .setRequired(true)
            )
    );

type Reminder = {
    timeStr: string,
    timeData: later.ScheduleData,
    message: string,
    channel: string,
    user: string,
};

const execute = async (interaction: ChatInputCommandInteraction, ctx: Ctx) => {
    const reminderKeyv = new Keyv(ctx.keyv.store, { namespace: 'reminders' });

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === SUBCOMMAND_ADD) {
        const time = interaction.options.getString(OPTION_TIME);
        const message = interaction.options.getString(OPTION_MESSAGE);
        if (time === null || message === null) {
            await interaction.reply({
                content: `Reminder time and messages are required.`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            const parsedTime = later.parse.text(time);
            if (parsedTime.error != -1) {
                await interaction.reply({
                    content: `Error parsing time "${time}" at position ${parsedTime.error}.`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                const reminders = await reminderKeyv.get<Array<Reminder>>(interaction.user.id) ?? [];
                reminders.push({
                    timeStr: time,
                    timeData: parsedTime,
                    message: message,
                    channel: interaction.channelId,
                    user: interaction.user.id,
                });
                await reminderKeyv.set(interaction.user.id, reminders);
                await interaction.reply({
                    content: `Added reminder at ${time} "${message}".`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    } else if (subcommand == SUBCOMMAND_LIST) {
        const reminders = await reminderKeyv.get<Array<Reminder>>(interaction.user.id) ?? [];
        if (reminders.length == 0) {
            await interaction.reply({
                content: 'No reminders set!',
                flags: MessageFlags.Ephemeral
            });
        } else {
            const reminderList = reminders.entries()
                .map(([ix, reminder]) => {
                    return `${ix + 1}. At ${reminder.timeStr}, "${reminder.message}".`
                })
                .toArray()
                .join('\n');
            await interaction.reply({
                content: `Current reminders:\n${reminderList}`,
                flags: MessageFlags.Ephemeral
            });
        }
    } else if (subcommand == SUBCOMMAND_CANCEL) {
        const reminders = await reminderKeyv.get<Array<Reminder>>(interaction.user.id) ?? [];
        const optIx = interaction.options.getInteger(OPTION_INDEX);
        if (optIx === null) {
            await interaction.reply({
                content: 'Index is required.',
                flags: MessageFlags.Ephemeral
            });
        } else {
            const ix = optIx - 1;
            if (ix < 0 || ix > reminders.length - 1) {
                await interaction.reply({
                    content: 'Index is out of range.',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                const removed = reminders.splice(ix, 1).at(0);
                await reminderKeyv.set(interaction.user.id, reminders);
                if (removed === undefined) {
                    await interaction.reply({
                        content: `Failed to remove reminder.`,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.reply({
                        content: `Removed reminder at ${removed.timeStr} "${removed.message}."`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    } else {
        await interaction.reply({
            content: `Unknown subcommand ${subcommand}.`,
            flags: MessageFlags.Ephemeral
        });
    }
};

const start = async (ctx: Ctx) => {
    const reminderKeyv = new Keyv<Array<Reminder>>(ctx.keyv.store, { namespace: 'reminders' });

    let lastTick = new Date();
    lastTick.setMilliseconds(0);

    setInterval(async () => {
        const tick = new Date();
        tick.setMilliseconds(0);

        if (reminderKeyv.iterator != undefined) {
            for await (const [userId, reminders] of reminderKeyv.iterator(undefined)) {
                const kept = []
                for (const [ix, reminder] of (reminders as Array<Reminder>).entries()) {
                    later.date.localTime();

                    const prev = later.schedule(reminder.timeData).prev(1);
                    if (Array.isArray(prev)) {
                        console.log('Removing invalid reminder...');
                    } else {
                        if (prev >= lastTick && prev < tick) {
                            console.log(`Sending reminder at ${reminder.timeStr} "${reminder.message}"`);

                            const channel = ctx.discordClient.channels.cache.get(reminder.channel);
                            if (channel?.isTextBased() && channel?.isSendable()) {
                                await channel.send({
                                    content: `<@${reminder.user}> ${reminder.message}`
                                });
                            }
                        }

                        const next = later.schedule(reminder.timeData).next(1, tick);
                        if (Array.isArray(next)) {
                            console.log('Removing invalid reminder...');
                        } else if (next >= tick) {
                            kept.push(reminder);
                        } else {
                            console.log(`Expired reminder at ${reminder.timeStr} "${reminder.message}" (next is ${next})`);
                        }
                    }
                }

                await reminderKeyv.set(userId, kept);
            }
        }
        
        lastTick = tick;
    }, 5000)
};

export default { data, execute, start };
