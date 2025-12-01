import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { LANG_CODES } from "../../constants/languages";
import { chunk } from "../../utils/arrays";

const BUTTONS_PER_ROW = 5;

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("langpanel")
    .setDescription("Post a language target role selection panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const botMember = interaction.guild.members.me;

    if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: "Bot is missing Manage Roles permission.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const buttonRows = createLanguageButtonRows();

    const panelContent = [
      "**🌐 Language Selection Panel**",
      "",
      "Pick your target language role.",
      "You can only have one language role at a time.",
      "Default is EN (if you have none).",
    ].join("\n");

    await interaction.reply({
      content: panelContent,
      components: buttonRows,
    });
  },
};

function createLanguageButtonRows(): ActionRowBuilder<ButtonBuilder>[] {
  const codeChunks = chunk([...LANG_CODES], BUTTONS_PER_ROW);

  return codeChunks.map((codes) => {
    const row = new ActionRowBuilder<ButtonBuilder>();

    for (const code of codes) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`lang:set:${code}`)
          .setLabel(code.toUpperCase())
          .setStyle(code === "en" ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );
    }

    return row;
  });
}