import { CommandInteraction } from 'discord.js';
import { ArgumentType } from '../../lib/ArgumentType';
import { Command } from '../../lib/Command';
import Driver from '../../lib/Driver';

export default class ManageCommand {

    @Command({
        name: 'manage',
        group: 'commands',
        meta: {
            description: 'Manage the points of a user.',
            examples: ['set user:@Goose#1832 points:1500', 'add user:@Goose#1832 points:3'],
        },
        args: [
            {
                name: 'set',
                description: 'Update the points of a user.',
                type: ArgumentType.SUB_COMMAND,
                options: [
                    {
                        name: 'user',
                        description: 'The user to set points of.',
                        type: ArgumentType.USER,
                        required: true,
                    },
                    {
                        name: 'points',
                        description: 'The amount of points.',
                        type: ArgumentType.INTEGER,
                        required: true,
                    },
                ]
            },
            {
                name: 'add',
                description: 'Add points to a user.',
                type: ArgumentType.SUB_COMMAND,
                options: [
                    {
                        name: 'user',
                        description: 'The user to add points to.',
                        type: ArgumentType.USER,
                        required: true,
                    },
                    {
                        name: 'points',
                        description: 'The amount of points.',
                        type: ArgumentType.INTEGER,
                        required: true,
                    },
                ]
            },
            {
                name: 'take',
                description: 'Take points from a user.',
                type: ArgumentType.SUB_COMMAND,
                options: [
                    {
                        name: 'user',
                        description: 'The user to take points from.',
                        type: ArgumentType.USER,
                        required: true,
                    },
                    {
                        name: 'points',
                        description: 'The amount of points.',
                        type: ArgumentType.INTEGER,
                        required: true,
                    },
                ]
            },
        ],
        permissions: [
            {
                id: '915751005000437821',
                type: 'ROLE',
                permission: true,
            },
        ],
    })
    async run(i: CommandInteraction) {
        await i.deferReply();
        const database = Driver.getDatabase();
        const user = i.options.getUser('user', true);
        const points = i.options.getInteger('points', true);
        Driver.tagCache.set(user.id, user.tag);
        const subcommand = i.options.getSubcommand(true);
        switch (subcommand) {
            case 'set':
                database.run('INSERT OR REPLACE INTO members(user, points) VALUES(?, ?)', [user.id, points], async (err) => {
                    if(err) {
                        await i.editReply({ content: 'An error occurred updating the points of that user. Please notify <@!194137531695104000>.' });
                        console.warn(err);
                        return;
                    }

                    await i.editReply({ content: `:sunglasses: Set total points of ${user.tag} to ${points} points.` });
                });
                break;
            case 'add':
            case 'take':
                database.all('SELECT points FROM members WHERE user = ?', [user.id], async (err, rows) => {
                    if(err) {
                        await i.editReply({ content: 'An error occurred updating the points of that user. Please notify <@!194137531695104000>.' });
                        console.warn(err);
                        return;
                    } else if(rows.length === 0)
                        rows = [{ points: 0 }];

                    database.run('INSERT OR REPLACE INTO members(user, points) VALUES(?, ?)', [user.id, rows[0].points + (points * (subcommand === 'add' ? 1 : -1))], async (err) => {
                        if(err) {
                            await i.editReply({ content: 'An error occurred updating the points of that user. Please notify <@!194137531695104000>.' });
                            console.warn(err);
                            return;
                        }
                    });
        
                    await i.editReply({ content: `:sunglasses: ${subcommand === 'add' ? 'Added' : 'Took'} ${points} points ${subcommand === 'add' ? 'to' : 'from'} total points of ${user.tag}.` });
                });
                break;
            default:
                await i.editReply({ content: `How bizarre.` });
                break;
        }
    }

}