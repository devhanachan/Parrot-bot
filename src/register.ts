import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { env } from "./config/env";

async function main(): Promise<void> {
  console.log("Registering commands...");

  const commands = await collectCommands();
  console.log(`Found ${commands.length} command(s)`);

  const rest = new REST({ version: "10" }).setToken(env.token);

  if (env.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(env.clientId, env.guildId),
      { body: commands }
    );
    console.log(`Registered ${commands.length} command(s) to guild: ${env.guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(env.clientId), { body: commands });
    console.log(`Registered ${commands.length} command(s) globally`);
  }

  console.log("Done!");
}

async function collectCommands(): Promise<any[]> {
  const commandsPath = path.join(import.meta.dir, "commands");
  const commandFiles = walkDirectory(commandsPath).filter((file) => file.endsWith(".ts"));
  const commands: any[] = [];

  for (const filePath of commandFiles) {
    const module = await import(pathToFileURL(filePath).href);
    const command = module.command || module.default;

    if (!command?.data) {
      console.warn(`Skipping ${filePath}: missing 'data' property`);
      continue;
    }

    commands.push(command.data.toJSON());
    console.log(`Collected: ${command.data.name}`);
  }

  return commands;
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

main().catch((error) => {
  console.error("Failed to register commands:", error);
  process.exit(1);
});