import { MessageFlags, PermissionFlagsBits } from "discord.js";
import type { ButtonInteraction, Interaction, Role, Guild } from "discord.js";
import { LANG_CODES, isValidLangCode, type LangCode } from "../constants/languages";
import { EXCLUDED_ROLE_NAMES } from "../constants/roles";
import { normalize } from "../utils/strings";

export async function handleLangButtons(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton()) {
    return false;
  }

  const button = interaction as ButtonInteraction;
  const [prefix, action, rawCode] = button.customId.split(":");

  if (prefix !== "lang" || action !== "set" || !rawCode) {
    return false;
  }

  const code = normalize(rawCode);

  if (!isValidLangCode(code)) {
    return false;
  }

  if (!button.inGuild() || !button.guild) {
    await button.reply({
      content: "This action can only be used in a guild.",
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

  await button.deferReply({ flags: MessageFlags.Ephemeral });

  const targetRole = findRoleByCode(button.guild, code);

  if (!targetRole) {
    await button.editReply({ content: `Role not found for: ${code}` });
    return true;
  }

  if (!isAllowedLangRole(button.guild.id, targetRole)) {
    await button.editReply({ content: "This role cannot be assigned." });
    return true;
  }

  if (targetRole.position >= botMember.roles.highest.position) {
    await button.editReply({
      content: "Bot role must be above the target language roles.",
    });
    return true;
  }

  try {
    const member = await button.guild.members.fetch(button.user.id);
    const langRoles = getLangRolesInGuild(button.guild, botMember.roles.highest.position);
    const langRoleIds = new Set(langRoles.map((role) => role.id));

    const rolesToRemove = member.roles.cache
      .filter((role) => langRoleIds.has(role.id) && role.id !== targetRole.id)
      .map((role) => role.id);

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove, "Language target selection");
    }

    if (!member.roles.cache.has(targetRole.id)) {
      await member.roles.add(targetRole.id, "Language target selection");
    }

    await button.editReply({
      content: `Target language set to: ${code.toUpperCase()}`,
    });
  } catch {
    await button.editReply({
      content: "Failed to update roles. Check bot role position and permissions.",
    });
  }

  return true;
}

function findRoleByCode(guild: Guild, code: string): Role | undefined {
  const normalizedCode = normalize(code);
  return guild.roles.cache.find((role) => normalize(role.name) === normalizedCode);
}

function isAllowedLangRole(guildId: string, role: Role): boolean {
  if (role.id === guildId) return false;
  if (role.managed) return false;
  if (EXCLUDED_ROLE_NAMES.has(normalize(role.name))) return false;
  return true;
}

function getLangRolesInGuild(guild: Guild, botTopPosition: number): Role[] {
  const roles: Role[] = [];

  for (const code of LANG_CODES) {
    const role = findRoleByCode(guild, code);

    if (!role) continue;
    if (!isAllowedLangRole(guild.id, role)) continue;
    if (role.position >= botTopPosition) continue;

    roles.push(role);
  }

  return roles;
}

export function detectTargetFromRoles(roles: readonly Role[]): LangCode {
  const roleNames = new Set(roles.map((role) => normalize(role.name)));

  for (const code of LANG_CODES) {
    if (roleNames.has(code)) {
      return code;
    }
  }

  return "en";
}