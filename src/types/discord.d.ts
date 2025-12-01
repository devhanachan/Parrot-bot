import { Collection } from "discord.js";
import type { Command } from "./index";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command<any>>;
  }
}