import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is responsive"),

  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`🏓 Pong! Latency: ${latency}ms`);
  },
};