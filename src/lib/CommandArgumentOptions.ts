import { ApplicationCommandOptionChoice } from "discord.js";
import { ArgumentType } from "./ArgumentType";

export interface CommandArgumentOptions {
	type: ArgumentType | number,
	name: string,
	description: string,
	required?: boolean,
	choices?: ApplicationCommandOptionChoice[],
	options?: CommandArgumentOptions[],
}