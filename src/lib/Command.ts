import { CommandHandler } from "./CommandHandler";
import { CommandOptions } from "./CommandOptions";

export function Command(options: CommandOptions): Function {
    return function (target: Function) {
        const commandHandler: CommandHandler = CommandHandler.getInstance();
        options._runner = target;
        commandHandler.registerCommand(options);
    }
}