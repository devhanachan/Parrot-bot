import { SlashCommandBuilder, GuildMember } from 'discord.js';
import type { Command } from '../types';
import z from 'zod';

const modelSchemaDataJson = z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    completed: z.boolean()
})

export const command: Command = {
    data: new SlashCommandBuilder ()
        .setName('myapi')
        .setDescription('fetch data json'),

    async execute ( interaction ) {
        try {
            const url = String('https://jsonplaceholder.typicode.com/todos/1');
            const res = await fetch(url);
            const data = await res.json();
            const json = modelSchemaDataJson.parse(data);
            
            await interaction.reply(
                "```json\n" + JSON.stringify(json,null,2) + "\n```"
            );
        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "error fetching data:"+
                    (error instanceof Error ? error.message: "idk"),
                });
            }
        }
    }
}