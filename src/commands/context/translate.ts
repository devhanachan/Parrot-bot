import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageFlags,
} from "discord.js";
import type { MessageContextMenuCommandInteraction, Role } from "discord.js";
import type { Command } from "../../types";
import { translateText } from "../../services/translateService";
import { getTranslateTarget, type LangCode } from "../../constants/languages";
import { detectTargetFromRoles } from "../../handlers/langButtonHandler";

export const command: Command<MessageContextMenuCommandInteraction> = {
  data: new ContextMenuCommandBuilder()
    .setName("Translate (Target Role)")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetMessage = interaction.targetMessage;
    const textContent = targetMessage?.content?.trim() ?? "";

    if (!textContent) {
      await interaction.reply({
        content: "No text to translate.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const memberRoles = extractMemberRoles(interaction);
    const detectedLangCode = detectTargetFromRoles(memberRoles);
    const targetLanguage = getTranslateTarget(detectedLangCode);

    try {
      const { translatedText } = await translateText(textContent, targetLanguage);
      await interaction.editReply({ content: translatedText || "Translation returned empty." });
    } catch (error) {
      console.error("Context translate error:", error);
      await interaction.editReply({ content: "Translation failed." });
    }
  },
};

function extractMemberRoles(interaction: MessageContextMenuCommandInteraction): Role[] {
  const member = interaction.member;

  if (!member || !("roles" in member)) {
    return [];
  }

  const rolesCache = (member.roles as any).cache;

  if (!rolesCache?.values) {
    return [];
  }

  return [...rolesCache.values()];
}