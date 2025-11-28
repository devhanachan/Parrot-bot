# 🦜 Parrot Bot — Discord Bot (TypeScript + Bun)

Parrot Bot is a simple and clean Discord bot template built with
**TypeScript**, **discord.js v14**, and **Bun**.\
This project is designed to be easy for contributors to understand,
extend, and add new commands.

---

## Project Structure

    project/
    │ package.json
    │ tsconfig.json
    │ bun.lock
    │ .env
    │
    ├── apis/
    ├── embeds/
    ├── events/
    │   └── messageCreate.ts
    │
    ├── commands/
    │   ├── ping.ts
    │   ├── myroles.ts
    │   ├── translate.ts
    │   ├── stealpfp.ts
    │   └── context/
    │       └── ping-message.ts
    │
    ├── main.ts
    ├── register.ts
    └── types.ts

---

## `types.ts` — Command Interface

This file defines a shared `Command` interface used by both **Slash Commands**
and **Context Menu Commands**.

It ensures:
- consistent structure
- TypeScript autocomplete
- safer dynamic loading of commands

---

## `register.ts` — Register Commands to Discord

Uploads all application commands (slash + context menu) to Discord via REST API.

Run this **whenever commands change**:

    bun run register.ts

Tip: If you set `GUILD_ID` in `.env`, commands will appear instantly in that server.

---

## `main.ts` — Bot Runtime

Handles:
- connecting the bot
- loading events + commands (including subfolders)
- listening for interactions (slash + context menu)
- executing the correct command

Run it with:

    bun run main.ts

---

## `commands/` — Command Files

Each file in this folder is one command.
Commands can be in the root `commands/` folder or nested in subfolders (e.g. `commands/context/`).

### Slash command (example)

```ts
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("This is an example command"),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    await interaction.reply("Hello from example command!");
  },
};
```

---

## Context Menu Commands (Right-click → Apps)

Discord supports commands that appear when you **right-click a user or a message**:

- **Message Context Menu**: right-click a message → Apps → your command
- **User Context Menu**: right-click a user → Apps → your command

### Message Context Menu (example)

Create a file like `commands/context/ping-message.ts`:

```ts
import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageFlags,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import type { Command } from "../../types";

export const command: Command<MessageContextMenuCommandInteraction> = {
  data: new ContextMenuCommandBuilder()
    .setName("Ping Message")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const msg = interaction.targetMessage;

    await interaction.reply({
      content: `Message content:\n> ${msg.content || "(no text)"}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
```

### User Context Menu (example)

```ts
import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageFlags,
  type UserContextMenuCommandInteraction,
} from "discord.js";
import type { Command } from "../../types";

export const command: Command<UserContextMenuCommandInteraction> = {
  data: new ContextMenuCommandBuilder()
    .setName("User Info")
    .setType(ApplicationCommandType.User),

  async execute(interaction) {
    const user = interaction.targetUser;

    await interaction.reply({
      content: `Selected user: ${user.tag}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
```

After adding a context menu command, run:

    bun run register.ts

Then restart the bot:

    bun run main.ts

---

## How to Create a New Command

1. Create a new file inside `commands/` (or a subfolder)
2. Export a `command` object using the `Command` interface
3. Add your builder + execute logic
4. Run:

    bun run register.ts

5. Run the bot:

    bun run main.ts
