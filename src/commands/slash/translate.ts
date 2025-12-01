import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types";
import { translateTextLegacy } from "../../services/translateService";
import { createTranslateEmbed } from "../../embeds/translateEmbed";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate text to a specified language")
    .addStringOption((option) =>
      option
        .setName("msg")
        .setDescription("Message to translate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("langcode")
        .setDescription("Target language code (default: en)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const message = interaction.options.getString("msg", true);
    const targetLanguage = interaction.options.getString("langcode")?.toLowerCase() ?? "en";

    await interaction.deferReply();

    try {
      const data = await translateTextLegacy(message, targetLanguage);

      const translatedText = extractTranslatedText(data);
      const sourceLanguage = extractSourceLanguage(data);

      await interaction.editReply({
        embeds: [
          createTranslateEmbed({
            from: sourceLanguage,
            to: targetLanguage,
            result: translatedText,
          }),
        ],
      });
    } catch (error) {
      console.error("Translation error:", error);
      await interaction.editReply("An error occurred while translating.");
    }
  },
};

function extractTranslatedText(data: any): string {
  if (!Array.isArray(data?.[0])) {
    return "";
  }

  return data[0]
    .map((item: any) => (item?.[0] ? String(item[0]) : ""))
    .join("");
}

function extractSourceLanguage(data: any): string {
  return data?.[2] ?? data?.[8]?.[0]?.[0] ?? "unknown";
}