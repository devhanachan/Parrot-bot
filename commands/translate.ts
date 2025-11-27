import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";
import axios from "axios";

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
      const url = encodeURI(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${msg}`
      );

      const { data } = await axios.get(url);

      // Extract translated text
      let translated = "";
      data[0].forEach((item: any) => {
        if (item[0]) translated += item[0];
      });

      // Detect source language
      const fromLang = data[2] === data[8][0][0] ? data[2] : data[8][0][0];

      await interaction.editReply(
        `**Translation:** ${translated}\n**From:** ${fromLang}\n**To:** ${lang}`
      );
    } catch (err) {
      console.error(err);
      await interaction.editReply("An error occurred while translating.");
    }
  },
};
