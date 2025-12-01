import {
  Client,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { env } from "./config/env";
import type { Command } from "./types";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection<string, Command<any>>();

async function loadEvents(): Promise<void> {
  const eventsPath = path.join(import.meta.dir, "events");
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const module = await import(`./events/${file}`);
    const event = module.default;

    if (!event?.name) {
      console.warn(`Event file ${file} is missing 'name' property`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`Loaded event: ${event.name}`);
  }
}

async function loadCommands(): Promise<void> {
  const commandsPath = path.join(import.meta.dir, "commands");
  const commandFiles = walkDirectory(commandsPath).filter((file) => file.endsWith(".ts"));

  for (const filePath of commandFiles) {
    const module = await import(pathToFileURL(filePath).href);
    const command: Command<any> | undefined = module.command || module.default;

    if (!command?.data?.name) {
      console.warn(`Command file ${filePath} is missing required properties`);
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  }
}

function walkDirectory(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function main(): Promise<void> {
  console.log("Starting bot...");

  await loadEvents();
  await loadCommands();

  await client.login(env.token);
  console.log("Bot is online!");
}

main().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});