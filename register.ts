import { REST, Routes } from "discord.js";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import "dotenv/config";

const dTK = process.env.TOKEN!;
const dCCL = process.env.CLIENT_ID!;
const dGID = process.env.GUILD_ID;

function walk(dir: string): string[] {
  const entries = readdirSync(dir).map((name) => path.join(dir, name));
  const files: string[] = [];
  for (const p of entries) {
    const st = statSync(p);
    if (st.isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

const commandsPath = path.join(process.cwd(), "commands");
const files = walk(commandsPath).filter((f) => f.endsWith(".ts"));

const commands: any[] = [];

for (const filePath of files) {
  const imported = await import(pathToFileURL(filePath).href);
  const cmd = imported.command || imported.default;
  if (!cmd?.data) continue;
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(dTK);

try {
  if (dGID) {
    await rest.put(Routes.applicationGuildCommands(dCCL, dGID), { body: commands });
    console.log("Uploaded successfully (guild)!");
  } else {
    await rest.put(Routes.applicationCommands(dCCL), { body: commands });
    console.log("Uploaded successfully (global)!");
  }
} catch (err) {
  console.error(err);
}
