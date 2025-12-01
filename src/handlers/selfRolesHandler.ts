import { MessageFlags, PermissionFlagsBits } from "discord.js";
import type {
  ButtonInteraction,
  Interaction,
  Role,
  Guild,
  StringSelectMenuInteraction,
} from "discord.js";
import { EXCLUDED_ROLE_NAMES, DEVELOPER_ROLE_NAME } from "../constants/roles";
import { normalize } from "../utils/strings";

const selectionStore = new Map<string, string[]>();

type DeveloperRoleResult = {
  id: string | null;
  reason: "ok" | "not_found" | "excluded" | "managed" | "too_high";
};

export async function handleSelfRolesUI(interaction: Interaction): Promise<boolean> {
  if (interaction.isStringSelectMenu()) {
    return handleSelectMenu(interaction as StringSelectMenuInteraction);
  }

  if (interaction.isButton()) {
    return handleButton(interaction as ButtonInteraction);
  }

  return false;
}

async function handleSelectMenu(menu: StringSelectMenuInteraction): Promise<boolean> {
  if (menu.customId !== "selfroles:pick") {
    return false;
  }

  if (!menu.inGuild() || !menu.guild) {
    await menu.reply({
      content: "This menu can only be used in a guild.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  const key = createStoreKey(menu.guild.id, menu.user.id);
  selectionStore.set(key, menu.values);
  await menu.deferUpdate();

  return true;
}

async function handleButton(button: ButtonInteraction): Promise<boolean> {
  const [prefix, action] = button.customId.split(":");

  if (prefix !== "selfroles") {
    return false;
  }

  if (!button.inGuild() || !button.guild) {
    await button.reply({
      content: "This button can only be used in a guild.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  const botMember = button.guild.members.me;

  if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await button.reply({
      content: "Bot is missing Manage Roles permission.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  const key = createStoreKey(button.guild.id, button.user.id);

  if (action === "reset") {
    selectionStore.delete(key);
    await button.reply({ content: "Cleared.", flags: MessageFlags.Ephemeral });
    return true;
  }

  if (action !== "submit") {
    return false;
  }

  await button.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const result = await processRoleSubmission(button, key);
    await button.editReply({ content: result });
  } catch {
    await button.editReply({
      content: "Failed to update roles. Check bot role position and permissions.",
    });
  }

  return true;
}

async function processRoleSubmission(
  button: ButtonInteraction,
  storeKey: string
): Promise<string> {
  const guild = button.guild!;
  const botMember = guild.members.me!;
  const savedSelections = selectionStore.get(storeKey) ?? [];

  const poolRoles = getPoolRoles(guild, botMember.roles.highest.position);
  const poolRoleIds = new Set(poolRoles.map((role) => role.id));

  const pickedRoleIds = new Set(
    savedSelections.filter((id) => poolRoleIds.has(id))
  );

  const developerResult = resolveDeveloperRole(guild, botMember.roles.highest.position);

  if (developerResult.id) {
    pickedRoleIds.add(developerResult.id);
  }

  const member = await guild.members.fetch(button.user.id);
  const currentPoolRoles = member.roles.cache.filter((role) => poolRoleIds.has(role.id));

  const rolesToAdd = [...pickedRoleIds].filter((id) => !member.roles.cache.has(id));
  const rolesToRemove = currentPoolRoles
    .filter((role) => !pickedRoleIds.has(role.id))
    .map((role) => role.id);

  if (rolesToAdd.length > 0) {
    await member.roles.add(rolesToAdd, "Selfroles selection");
  }

  if (rolesToRemove.length > 0) {
    await member.roles.remove(rolesToRemove, "Selfroles selection");
  }

  const developerMessage = getDeveloperStatusMessage(developerResult);

  return `Applied. Added: ${rolesToAdd.length}, Removed: ${rolesToRemove.length}. ${developerMessage}`;
}

function createStoreKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

export function getPoolRoles(guild: Guild, botTopPosition: number): Role[] {
  return [...guild.roles.cache.values()]
    .filter((role) => isAllowedSelfRole(guild.id, role) && role.position < botTopPosition)
    .sort((a, b) => b.position - a.position);
}

function isAllowedSelfRole(guildId: string, role: Role): boolean {
  if (role.id === guildId) return false;
  if (role.managed) return false;
  if (EXCLUDED_ROLE_NAMES.has(role.name.toLowerCase())) return false;
  return true;
}

function resolveDeveloperRole(guild: Guild, botTopPosition: number): DeveloperRoleResult {
  const role = guild.roles.cache.find(
    (r) => r.name.trim().toLowerCase() === DEVELOPER_ROLE_NAME
  );

  if (!role) {
    return { id: null, reason: "not_found" };
  }

  if (EXCLUDED_ROLE_NAMES.has(role.name.toLowerCase())) {
    return { id: null, reason: "excluded" };
  }

  if (role.managed) {
    return { id: null, reason: "managed" };
  }

  if (role.position >= botTopPosition) {
    return { id: null, reason: "too_high" };
  }

  if (role.id === guild.id) {
    return { id: null, reason: "excluded" };
  }

  return { id: role.id, reason: "ok" };
}

function getDeveloperStatusMessage(result: DeveloperRoleResult): string {
  switch (result.reason) {
    case "ok":
      return "Developer: added (or already had).";
    case "not_found":
      return "Developer: role not found.";
    case "too_high":
      return "Developer: bot role is below Developer role.";
    case "managed":
      return "Developer: managed role cannot be assigned.";
    default:
      return "Developer: blocked.";
  }
}