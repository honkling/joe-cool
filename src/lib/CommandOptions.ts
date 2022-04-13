import { ApplicationCommandPermissionData } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { CommandArgumentOptions } from "./CommandArgumentOptions";

export interface CommandOptions {
    name: string,
    type?: ApplicationCommandTypes,
    meta: { description: string, examples: string[] },
    group: string,
    args?: CommandArgumentOptions[],
    permissions?: ApplicationCommandPermissionData[],
    _runner?: any,
    _class?: any,
}