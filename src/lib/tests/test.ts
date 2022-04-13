import { join } from "path";
import { CommandHandler } from "../CommandHandler";

const discord = require('discord.js');

const bot = new discord.Client({ intents: [] });

bot.on('ready', () => {
    console.log('ok');
    const commandHandler = new CommandHandler(bot, join(__dirname, "commands"))
        .registerGroup("test", "misky")
        .registerCommands();
});

bot.login('go away max');