# 🦜 Parrot Bot

A feature-rich Discord bot built with **TypeScript**, **Discord.js v14**, and **Bun** runtime. Designed for translation, role management, and server moderation.

![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Runtime-fbf0df?style=flat-square&logo=bun&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **Translation** | Translate text via slash commands or context menu |
| 🎭 **Self-Roles** | Interactive role selection panel for members |
| 🗣️ **Language Roles** | Set target translation language via role buttons |
| 🔗 **URL Moderation** | Automatic URL detection and removal |
| 🖼️ **Avatar Fetcher** | Retrieve any user's profile picture by ID |

---

## 📸 Preview

### Context Menu Translation
![Context Menu Demo](https://github.com/user-attachments/assets/39a8497c-95f2-461f-ae47-7abc0f72f5c3)

### Role Selection Panel
![Role Selection Demo](https://github.com/user-attachments/assets/acd1afd9-411e-4220-801b-3a3d5c41a42d)

---

## 📁 Project Structure

```
Parrot-bot/
├── src/
│   ├── commands/
│   │   ├── context/          # Context menu commands
│   │   │   └── translate.ts
│   │   └── slash/            # Slash commands
│   │       ├── langpanel.ts
│   │       ├── ping.ts
│   │       ├── selfroles.ts
│   │       ├── translate.ts
│   │       └── userpfp.ts
│   ├── config/
│   │   └── env.ts            # Environment configuration
│   ├── constants/
│   │   ├── languages.ts      # Language codes & mappings
│   │   └── roles.ts          # Role configuration
│   ├── embeds/
│   │   └── translateEmbed.ts # Translation result embed
│   ├── events/
│   │   ├── interactionCreate.ts
│   │   └── messageCreate.ts
│   ├── handlers/
│   │   ├── langButtonHandler.ts
│   │   └── selfRolesHandler.ts
│   ├── services/
│   │   └── translateService.ts
│   ├── types/
│   │   ├── discord.d.ts      # Discord.js type extensions
│   │   └── index.ts          # Shared type definitions
│   ├── utils/
│   │   ├── arrays.ts
│   │   └── strings.ts
│   ├── main.ts               # Bot entry point
│   └── register.ts           # Command registration
├── .env                      # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- Discord Bot Token ([Create one here](https://discord.com/developers/applications))
- Node.js 18+ (for Discord.js compatibility)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/parrot-bot.git
cd parrot-bot
```

**2. Install dependencies**
```bash
bun install
```

**3. Configure environment variables**

Create a `.env` file in the project root:
```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_client_id
GUILD_ID=your_development_server_id  # Optional: for guild-specific commands
```

**4. Register commands**
```bash
bun run register
```

**5. Start the bot**
```bash
bun run start
```

### Development Mode

Run with hot reload:
```bash
bun run dev
```

---

## 📋 Commands

### Slash Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/ping` | Check bot latency | Everyone |
| `/translate` | Translate text to a specified language | Everyone |
| `/stealpfp` | Get a user's profile picture by ID | Everyone |
| `/langpanel` | Post language role selection panel | Administrator |
| `/selfroles` | Post self-role selection panel | Administrator |

### Context Menu Commands

| Command | Type | Description |
|---------|------|-------------|
| `Translate (Target Role)` | Message | Translate selected message based on your language role |

---

## 🎮 Usage Guide

### Translation

**Slash Command:**
```
/translate msg:Hello, how are you? langcode:ja
```

**Context Menu:**
1. Right-click any message
2. Navigate to **Apps** → **Translate (Target Role)**
3. Translation uses your assigned language role (defaults to English)

### Language Panel

Administrators can create a language selection panel:
```
/langpanel
```

Users click buttons to set their target translation language. Only one language role is active at a time.

**Supported Languages:**
- 🇬🇧 English (en)
- 🇹🇭 Thai (th)
- 🇯🇵 Japanese (ja)
- 🇵🇭 Filipino (fil)
- 🇮🇩 Indonesian (id)
- 🇪🇬 Arabic - Egyptian (ar-eg)
- 🇬🇭 Akan (ak)
- 🇬🇭 Ewe (ee)
- 🇬🇭 Ga (gaa)
- 🇬🇭 Dagbani (dag)

### Self-Roles Panel

Administrators can create a role selection panel:
```
/selfroles
```

- Users select roles from the dropdown menu
- Press **Submit** to apply selected roles
- Press **Reset** to clear selection
- Developer role is auto-assigned when submitting

---

## 🛠️ Development

### Adding a New Slash Command

Create a new file in `src/commands/slash/`:

```typescript
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("An example command"),

  async execute(interaction) {
    await interaction.reply("Hello from example command!");
  },
};
```

### Adding a Context Menu Command

Create a new file in `src/commands/context/`:

```typescript
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageFlags,
} from "discord.js";
import type { MessageContextMenuCommandInteraction } from "discord.js";
import type { Command } from "../../types";

export const command: Command<MessageContextMenuCommandInteraction> = {
  data: new ContextMenuCommandBuilder()
    .setName("Example Action")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const message = interaction.targetMessage;
    
    await interaction.reply({
      content: `Message content: ${message.content}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
```

### After Adding Commands

Register the new commands with Discord:
```bash
bun run register
```

Then restart the bot:
```bash
bun run start
```

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `bun run start` | Start the bot |
| `bun run dev` | Start with hot reload |
| `bun run register` | Register commands to Discord |
| `bun run test` | Run tests with Vitest |
| `bun run lint` | Type-check with TypeScript |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TOKEN` | ✅ | Discord bot token |
| `CLIENT_ID` | ✅ | Discord application ID |
| `GUILD_ID` | ❌ | Guild ID for dev commands (instant updates) |

### Role Configuration

Edit `src/constants/roles.ts` to customize:
- `EXCLUDED_ROLE_NAMES` - Roles excluded from self-role selection
- `DEVELOPER_ROLE_NAME` - Auto-assigned developer role name

### Language Configuration

Edit `src/constants/languages.ts` to:
- Add/remove supported languages in `LANG_CODES`
- Map language codes to Google Translate codes in `TRANSLATE_TARGET`

---

## 🔧 Troubleshooting

### Commands not appearing

1. Ensure `bun run register` completed successfully
2. Check bot has `applications.commands` scope
3. Wait up to 1 hour for global commands (instant for guild commands)

### Bot missing permissions

Ensure the bot role has:
- `Manage Roles` - For role assignment features
- `Send Messages` - For responding to commands
- `Manage Messages` - For URL moderation

### Translation not working

- Google Translate API may rate-limit frequent requests
- Check network connectivity
- Verify the language code is valid

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add: amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Bun](https://bun.sh/) - JavaScript runtime
- [Google Translate](https://translate.google.com/) - Translation service