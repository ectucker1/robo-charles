import type { Command } from './context.js'

import { default as pingCommand } from './commands/ping.js';
import { default as reminderCommand } from './commands/reminder.js';

const srcCommands = [
    pingCommand,
    reminderCommand
];

let validCommands: Command[] = []
for (const command of srcCommands) {
    if ('data' in command && 'execute' in command) {
        validCommands.push(command);
    } else {
        console.log(`[WARNING] A command is missing a required "data" or "execute" property.`);
    }
}

export default validCommands;
