import { Events } from "discord.js";
import type { Event } from "../types";
import { handleSelfRolesUI } from "../handlers/selfRolesHandler";
import { handleLangButtons } from "../handlers/langButtonHandler";

const event: Event<"interactionCreate"> = {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction) {
    if (await handleSelfRolesUI(interaction)) {
      return;
    }

    if (await handleLangButtons(interaction)) {
      return;
    }

    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
      return;
    }

    if (interaction.isMessageContextMenuCommand()) {
      await handleContextMenuCommand(interaction);
      return;
    }
  },
};

async function handleSlashCommand(
  interaction: Parameters<Event<"interactionCreate">["execute"]>[0]
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await (command as any).execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);

    const errorMessage = "An error occurred while executing this command.";

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

async function handleContextMenuCommand(
  interaction: Parameters<Event<"interactionCreate">["execute"]>[0]
): Promise<void> {
  if (!interaction.isMessageContextMenuCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`Unknown context menu command: ${interaction.commandName}`);
    return;
  }

  try {
    await (command as any).execute(interaction);
  } catch (error) {
    console.error(`Error executing context menu ${interaction.commandName}:`, error);

    const errorMessage = "An error occurred while executing this action.";

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

export default event;