import { ApplicationCommand, Client, Collection, Guild, Interaction } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { CommandOptions } from "./CommandOptions";
import { GroupAlreadyExistsError } from "./exceptions/GroupAlreadyExistsError";
import { CommandAlreadyExistsError } from "./exceptions/CommandAlreadyExistsError";
import { join } from "path";
import { readdirSync } from "fs";
import { CommandArgumentOptions } from "./CommandArgumentOptions";

export class CommandHandler {
    private static instance: CommandHandler;
    private static client: Client;
    private static rest: REST;
    private bot: Client;
    private directory: string;
    private commandData: Map<string, { name: string, description: string, options?: CommandArgumentOptions[], default_permission: boolean | undefined }>
    public groups: Map<string, { name: string, commands: CommandOptions[] }>
    public commands: Map<string, CommandOptions>;

    constructor(bot: Client, directory: string) {
        this.bot = bot;
        this.groups = new Map();
        this.commands = new Map();
        this.commandData = new Map();
        this.directory = directory;
        CommandHandler.rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        CommandHandler.instance = this;
        CommandHandler.client = bot;
        bot.on('interactionCreate', (i: Interaction) => {
            if(!i.isCommand()) return;
            const cmd = this.commands.get(i.commandName.toLowerCase());
            if(!cmd) return;
            cmd._runner.run(i);
        });
    }

    public static getInstance(): CommandHandler {
        return CommandHandler.instance;
    }

    public static getRestInstance() : REST {
        return CommandHandler.rest;
    }

    public static getBotInstance(): Client {
        return CommandHandler.client;
    }

    public registerGroup(name: string, directory: string): CommandHandler {
        if(this.groups.get(name)) throw new GroupAlreadyExistsError(`There is already a group under the name "${name}."`);
        this.groups.set(directory, { name, commands: [] });
        return this;
    }

    public registerGroups(groups: { name: string, directory: string }[]): CommandHandler {
        for(const group of groups) this.registerGroup(group.name, group.directory);
        return this;
    }

    public registerCommand(options: CommandOptions): CommandHandler {
        const { name, meta, args = [], group, permissions } = options;
        if(this.commands.get(name)) throw new CommandAlreadyExistsError(`There is already a command under the name "${name}."`);
        this.commands.set(name.toLowerCase(), options);
        this.groups.get(group)?.commands.push(options);
        const data = {
            name: name.toLowerCase(),
            description: meta.description,
            options: args,
            default_permission: permissions ? false : true,
        };
        this.commandData.set(name.toLowerCase(), data);
        return this;
    }

    public registerCommands(): CommandHandler {
        this.groups.forEach((_, directory: string) => {
            const base = join(this.directory, directory);
            const files = readdirSync(base).filter((file) => !file.endsWith('.disabled.ts'));
            for(const file of files) {
                const path = join(base, file);
                const constructor = require(path);
                new constructor.default();
            }
        });
        const array = Array.from(this.commandData, ([, value]) => value);
        CommandHandler.rest.put(
            Routes.applicationGuildCommands(this.bot.application?.id as string, process.env.GUILD as string),
            { body: array }
        );
        this.bot.guilds.fetch(process.env.GUILD).then((g: Guild) => {
            g.commands.fetch().then((commands: Collection<string, ApplicationCommand<{}>>) => {
                const fullPermissions = [];
                for(const command of Array.from(commands, ([, value ]) => value)) {
                    const option = Array.from(this.commands, ([, value ]) => value).filter((x: CommandOptions) => x.name.toLowerCase() === command.name.toLowerCase())[0];
                    if(option.permissions) fullPermissions.push({
                        id: command.id,
                        permissions: option.permissions,
                    });
                }
                g.commands.permissions.set({ fullPermissions }).then(() => console.log('Set permissions.')).catch(console.error);
            }).catch(console.error);
        }).catch(console.error);
        return this;
    }
}