import { CommandInteraction } from "discord.js";
import { Command } from "../../../Command";

export default class PingCommand2 {

    @Command({
        name: "ping2",
        group: "test",
        meta: {
            description: "Test ping 2",
            examples: [],
        },
    })
    run(i: CommandInteraction) {
        i.reply({ content: "Pong 2!", ephemeral: true });
    }

}