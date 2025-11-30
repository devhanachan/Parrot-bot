import {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  type ChatInputCommandInteraction,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import "dotenv/config";
import type { Command } from "./types";

const dTK = process.env.TOKEN!;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const eventsPath = path.join(import.meta.dir, "events");
const eventsFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".ts"));

for (const file of eventsFiles) {
  const event = await import(`./events/${file}`);
  const ev = event.default;

  if (ev.once) client.once(ev.name, (...args) => ev.execute(...args));
  else client.on(ev.name, (...args) => ev.execute(...args));
}

function walk(dir: string): string[] {
  const entries = readdirSync(dir).map((name) => path.join(dir, name));
  const out: string[] = [];
  for (const p of entries) {
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

client.commands = new Collection<string, Command<any>>();

const commandsPath = path.join(process.cwd(), "commands");
const files = walk(commandsPath).filter((f) => f.endsWith(".ts"));

for (const filePath of files) {
  const imported = await import(pathToFileURL(filePath).href);
  const cmd: Command<any> | undefined = imported.command || imported.default;
  if (!cmd?.data?.name) continue;
  client.commands.set(cmd.data.name, cmd);
}


client.login(dTK);
