import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  Role,
  StringSelectMenuInteraction,
} from "discord.js";

const EXCLUDED_ROLE_NAMES = new Set(
  ["Owner", "parrot", "S", "Parrot(Staging)"].map((s) => s.toLowerCase())
);

const selectionStore = new Map<string, string[]>();

const REQUIRED_DEVELOPER_ROLE_ID: string | null = null;
const REQUIRED_DEVELOPER_ROLE_NAME = "developer";

function storeKey(guildId: string, userId: string) {
  return `${guildId}:${userId}`;
}

function isAllowedSelfRole(guildId: string, role: Role) {
  if (role.id === guildId) return false;
  if (role.managed) return false;
  if (EXCLUDED_ROLE_NAMES.has(role.name.toLowerCase())) return false;
  return true;
}

function getPoolRoles(guild: NonNullable<ChatInputCommandInteraction["guild"]>, botTopPos: number): Role[] {
  return [...guild.roles.cache.values()]
    .filter((r) => isAllowedSelfRole(guild.id, r) && r.position < botTopPos)
    .sort((a, b) => b.position - a.position);
}

function resolveDeveloperRole(
  guild: NonNullable<ChatInputCommandInteraction["guild"]>,
  botTopPos: number
): { id: string | null; reason: "ok" | "not_found" | "excluded" | "managed" | "too_high" } {
  let r: Role | undefined;

  if (REQUIRED_DEVELOPER_ROLE_ID) {
    r = guild.roles.cache.get(REQUIRED_DEVELOPER_ROLE_ID);
  } else {
    r = guild.roles.cache.find((x) => x.name.trim().toLowerCase() === REQUIRED_DEVELOPER_ROLE_NAME);
  }

  if (!r) return { id: null, reason: "not_found" };
  if (EXCLUDED_ROLE_NAMES.has(r.name.toLowerCase())) return { id: null, reason: "excluded" };
  if (r.managed) return { id: null, reason: "managed" };
  if (r.position >= botTopPos) return { id: null, reason: "too_high" };
  if (r.id === guild.id) return { id: null, reason: "excluded" };

  return { id: r.id, reason: "ok" };
}

export const data = new SlashCommandBuilder()
  .setName("selfroles")
  .setDescription("Post a self-role panel")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export default {
  data,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "You are not allowed to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const me = interaction.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: "Bot is missing Manage Roles permission.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const pool = getPoolRoles(interaction.guild, me.roles.highest.position);
    const options = pool.slice(0, 25).map((r) => ({
      label: r.name.slice(0, 100),
      value: r.id,
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId("selfroles:pick")
      .setPlaceholder("Select roles")
      .setMinValues(0)
      .setMaxValues(Math.min(25, options.length))
      .addOptions(options);

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("selfroles:submit").setLabel("Submit").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("selfroles:reset").setLabel("Reset").setStyle(ButtonStyle.Secondary)
    );

    const content = [
      "Choose as many roles as you want.",
      "",
      "**Condition:**",
      "- If you're a developer, you must pick the Developer role to access the hidden channels.",
      "- After submitting your role, if nothing happens, just press it again."
    ].join("\n");

    await interaction.reply({ content, components: [row1, row2] });
  },
};

export async function handleSelfRolesUI(interaction: Interaction): Promise<boolean> {
  if (interaction.isStringSelectMenu()) {
    const menu = interaction as StringSelectMenuInteraction;
    if (menu.customId !== "selfroles:pick") return false;

    if (!menu.inGuild() || !menu.guild) {
      await menu.reply({ content: "This menu can only be used in a guild.", flags: MessageFlags.Ephemeral });
      return true;
    }

    selectionStore.set(storeKey(menu.guild.id, menu.user.id), menu.values);
    await menu.deferUpdate();
    return true;
  }

  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;
    const parts = btn.customId.split(":");
    if (parts.length !== 2 || parts[0] !== "selfroles") return false;

    if (!btn.inGuild() || !btn.guild) {
      await btn.reply({ content: "This button can only be used in a guild.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const me = btn.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await btn.reply({ content: "Bot is missing Manage Roles permission.", flags: MessageFlags.Ephemeral });
      return true;
    }

    const action = parts[1];
    const key = storeKey(btn.guild.id, btn.user.id);

    if (action === "reset") {
      selectionStore.delete(key);
      await btn.reply({ content: "Cleared.", flags: MessageFlags.Ephemeral });
      return true;
    }

    if (action !== "submit") return false;

    await btn.deferReply({ flags: MessageFlags.Ephemeral });

    const saved = selectionStore.get(key) ?? [];

    const pool = getPoolRoles(btn.guild, me.roles.highest.position);
    const poolIds = new Set(pool.map((r) => r.id));

    const picked = new Set(saved.filter((id) => poolIds.has(id)));

    const dev = resolveDeveloperRole(btn.guild, me.roles.highest.position);
    if (dev.id) picked.add(dev.id);

    const pickedAllowed = [...picked];

    const member = await btn.guild.members.fetch(btn.user.id);

    const currentPoolRoles = member.roles.cache.filter((r) => poolIds.has(r.id));
    const toAdd = pickedAllowed.filter((id) => !member.roles.cache.has(id));
    const toRemove = currentPoolRoles.filter((r) => !pickedAllowed.includes(r.id)).map((r) => r.id);

    try {
      if (toAdd.length) await member.roles.add(toAdd, "Selfroles selection");
      if (toRemove.length) await member.roles.remove(toRemove, "Selfroles selection");

      let devMsg = "";
      if (dev.reason === "ok") devMsg = "Developer: added (or already had).";
      else if (dev.reason === "not_found") devMsg = "Developer: role not found.";
      else if (dev.reason === "too_high") devMsg = "Developer: bot role is below Developer role.";
      else if (dev.reason === "managed") devMsg = "Developer: managed role cannot be assigned.";
      else devMsg = "Developer: blocked.";

      await btn.editReply({
        content: `Applied. Added: ${toAdd.length}, Removed: ${toRemove.length}. ${devMsg}`,
      });
    } catch {
      await btn.editReply({
        content: "Failed to update roles. Check bot role position and permissions.",
      });
    }

    return true;
  }

  return false;
}
