import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("stealpfp")
    .setDescription("Get someone's profile picture by their user ID")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("The user ID to get the avatar from")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString("userid", true);

    try {
      const user = await interaction.client.users.fetch(userId);
      const avatarUrl = user.displayAvatarURL({ size: 2048 });
      await interaction.reply(avatarUrl);
    } catch {
      await interaction.reply({
        content: "Invalid user ID or user not found.",
        ephemeral: true,
      });
    }
  },
};