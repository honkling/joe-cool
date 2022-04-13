import { CommandInteraction, MessageEmbed } from 'discord.js';
import getBot from '../..';
import { ArgumentType } from '../../lib/ArgumentType';
import { Command } from '../../lib/Command';
import Driver from '../../lib/Driver';

export default class PointsCommand {

    @Command({
        name: 'points',
        group: 'commands',
        meta: {
            description: 'View the points of users.',
            examples: ['view user:@Goose#1832', 'leaderboard'],
        },
        args: [
            {
                name: 'view',
                description: 'View the points of a user.',
                type: ArgumentType.SUB_COMMAND,
                options: [
                    {
                        name: 'user',
                        description: 'The user to set points of.',
                        type: ArgumentType.USER,
                        required: true,
                    },
                ]
            },
            {
                name: 'leaderboard',
                description: 'View people with the most points.',
                type: ArgumentType.SUB_COMMAND,
                options: [
                    {
                        name: 'invert',
                        description: 'Invert the leaderboard to view people with least points.',
                        type: ArgumentType.BOOLEAN,
                        required: false,
                    },
                ],
            },
        ]
    })
    async run(i: CommandInteraction) {
        await i.deferReply();
        const database = Driver.getDatabase();
        const subcommand = i.options.getSubcommand(true);
        switch (subcommand) {
            case 'view':
                const user = i.options.getUser('user');
                database.all('SELECT points FROM members WHERE user = ?', [user.id], async (err, rows) => {
                    if(err) {
                        await i.editReply({ content: 'An error occurred viewing the points of that user. Please notify <@!194137531695104000>.' });
                        console.warn(err);
                        return;
                    }

                    if(rows.length === 0)
                        rows = [{ points: 0 }];

                    Driver.tagCache.set(user.id, user.tag);
                    await i.editReply({ content: `${user.tag} has ${rows[0].points} points.` });
                });
                break;
            case 'leaderboard':
                const invert = i.options.getBoolean('invert', false);
                database.all('SELECT * FROM members', async (err, rows) => {
                    if(err) {
                        await i.editReply({ content: 'An error occurred viewing the leaderboard. Please notify <@!194137531695104000>.' });
                        console.warn(err);
                        return;
                    }

                    if(!rows)
                        rows = new Array(10);

                    rows = rows.sort(invert ? ((a, b) => {
                        if(!a.points) a.points = 0;
                        if (!b.points) b.points = 0;
                        if(a.points === b.points) return 0;
                        else return a.points > b.points ? 1 : -1;
                    }) : ((a, b) => {
                        if(!a.points) a.points = 0;
                        if(!b.points) b.points = 0;
                        if(a.points === b.points) return 0;
                        else return a.points > b.points ? -1 : 1;
                    }));

                    const embed = new MessageEmbed()
                        .setTitle(":medal: Leaderboard")
                        .setDescription(await (async (): Promise<string> => {
                            let builder = `Here's a list of ${invert ? "bottom" : "top"} users.\n\n`;
                            for(let i = 1; i < 11; i++) {
                                if(i > 10)
                                    break;
                                const row = rows[i - 1];
                                let representative = `${i}.`;
                                switch (i) {
                                    case 1:
                                        representative = ':first_place:';
                                        break;
                                    case 2:
                                        representative = ':second_place:';
                                        break;
                                    case 3:
                                        representative = ':third_place:';
                                        break;
                                }
                                let tag: string;
                                if(Driver.tagCache.has(row.user))
                                    tag = Driver.tagCache.get(row.user);
                                else {
                                    tag = (await getBot().users.fetch(row.user)).tag;
                                    Driver.tagCache.set(row.user, tag);
                                }
                                if(row) builder += `${representative} ${tag} with ${row.points} points\n`;
                                else builder += `${representative} Nobody\n`;
                            }
                            return builder.trim();
                        })())
                        .setFooter({ text: `Requested by ${i.user.tag}`, iconURL: i.user.displayAvatarURL() });
                    
                    await i.editReply({ embeds: [embed] });
                });
                break;
            default:
                await i.editReply({ content: `How bizarre.` });
                break;
        }
    }

}