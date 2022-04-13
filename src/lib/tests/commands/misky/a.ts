import { CommandInteraction } from "discord.js";
import { Command } from "../../../Command";

export default class PingCommand {

    @Command({
        name: "ping",
        group: "test",
        meta: {
            description: "Test ping",
            examples: [],
        },
    })
    run(i: CommandInteraction) {
        i.reply({ content: "Pong!", ephemeral: true });
    }

}