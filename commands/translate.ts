import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";
import axios from "axios";
import { googleTranslate } from "../apis/google";
import { createTranslateEmbed } from '../embeds/translateEmbed';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate text")
    .addStringOption((opt) =>
      opt
        .setName("msg")
        .setDescription("Message to translate")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("langcode")
        .setDescription("Target language code (default: en)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("msg", true);
    const lang =
      interaction.options.getString("langcode")?.toLowerCase() || "en";

    await interaction.deferReply(); // prevents "interaction failed"

    try {
      const data=await googleTranslate(msg, lang);

      // Extract translated text
      let translated = "";
      data[0].forEach((item: any) => {
        if (item[0]) translated += item[0];
      });

      // Detect source language
      const fromLang =
        data?.[2] ??
        data?.[8]?.[0]?.[0] ??
        'unknown';

      await interaction.editReply({
        embeds: [
          createTranslateEmbed({
            from: fromLang,
            to: lang,
            result: translated
          })
        ]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply("An error occurred while translating.");
    }
  },
};
