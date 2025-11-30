import { Events } from "discord.js";
import type { Event } from "../types";
import { handleSelfRolesUI } from "../commands/Selectrole";
import { handleLangButtons } from "../commands/langpanel";

const event: Event<"interactionCreate"> = {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction) {
    if (await handleSelfRolesUI(interaction)) return;
    if (await handleLangButtons(interaction)) return;

    if (interaction.isChatInputCommand()) {
      const cmd = interaction.client.commands.get(interaction.commandName);
      if (cmd) await (cmd as any).execute(interaction);
      return;
    }

    if (interaction.isMessageContextMenuCommand()) {
      const cmd = interaction.client.commands.get(interaction.commandName);
      if (cmd) await (cmd as any).execute(interaction);
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "my_select") {
      await interaction.deferUpdate();
      await interaction.followUp({ content: `you selected: ${interaction.values[0]}` });
      return;
    }
  },
};

export default event;
