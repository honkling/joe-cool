import { join } from "path";
import { CommandHandler } from "./lib/CommandHandler";
import { config } from "dotenv";
import Driver from "./lib/Driver";

const { Client } = require('discord.js');

const bot = new Client({ intents: [] });
config({ path: join(__dirname, "../.env" )});
new Driver();
const database = Driver.getDatabase();
database.run(`CREATE TABLE IF NOT EXISTS members(
    user TEXT NOT NULL UNIQUE PRIMARY KEY,
    points INTEGER NOT NULL
)`);

bot.on('ready', () => {
    console.log('The Jad Council is ready.');
    const commandHandler = new CommandHandler(bot, join(__dirname, "commands"))
        .registerGroup("Admin", "admin")
        .registerGroup("User", "user")
        .registerCommands();
});

bot.login(process.env.TOKEN);

export default function getBot(): typeof bot {
    return bot;
}