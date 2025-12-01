import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { getPoolRoles } from "../../handlers/selfRolesHandler";
import { MAX_SELECT_MENU_OPTIONS } from "../../constants/roles";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("selfroles")
    .setDescription("Post a self-role selection panel")
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

    const poolRoles = getPoolRoles(interaction.guild, botMember.roles.highest.position);
    const menuOptions = poolRoles.slice(0, MAX_SELECT_MENU_OPTIONS).map((role) => ({
      label: role.name.slice(0, 100),
      value: role.id,
    }));

    if (menuOptions.length === 0) {
      await interaction.reply({
        content: "No assignable roles available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selfroles:pick")
      .setPlaceholder("Select your roles")
      .setMinValues(0)
      .setMaxValues(menuOptions.length)
      .addOptions(menuOptions);

    const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("selfroles:submit")
        .setLabel("Submit")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("selfroles:reset")
        .setLabel("Reset")
        .setStyle(ButtonStyle.Secondary)
    );

    const panelContent = [
      "**🎭 Self-Role Selection Panel**",
      "",
      "Choose as many roles as you want.",
      "",
      "**Conditions:**",
      "• If you're a developer, you must pick the Developer role to access hidden channels.",
      "• After submitting, if nothing happens, press Submit again.",
    ].join("\n");

    await interaction.reply({
      content: panelContent,
      components: [menuRow, buttonRow],
    });
  },
};