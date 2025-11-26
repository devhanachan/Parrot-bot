import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv'

const dcTK = String(process.env.TOKEN);
const dcCLi = String(process.env.CLIENT_ID);

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(dcTK);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(dcCLi), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}