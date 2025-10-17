import { default as pingCommand } from './commands/ping.mjs';

const srcCommands = [
    pingCommand
];

let validCommands = []
for (const command of srcCommands) {
    if ('data' in command && 'execute' in command) {
        validCommands.push(command);
    } else {
        console.log(`[WARNING] A command is missing a required "data" or "execute" property.`);
    }
}

export default validCommands;
