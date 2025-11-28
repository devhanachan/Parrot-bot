import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  MessageFlags,
  type MessageContextMenuCommandInteraction,
} from "discord.js";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Ping Message")
    .setType(ApplicationCommandType.Message),

  async execute(interaction: MessageContextMenuCommandInteraction) {
    const msg = interaction.targetMessage;

    await interaction.reply({
      content: `this message says:\n> ${msg.content || "(no text)"}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
