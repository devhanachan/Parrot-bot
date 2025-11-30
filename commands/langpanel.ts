// commands/langpanel.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { ButtonInteraction, ChatInputCommandInteraction, Interaction, Role } from "discord.js";

const LANG_CODES = [
  "en",
  "th",
  "ja",
  "fil",
  "id",
  "ar-eg",
  "ak",
  "ee",
  "gaa",
  "dag",
] as const;

type LangCode = (typeof LANG_CODES)[number];

const EXCLUDED_ROLE_NAMES = new Set(["Owner", "parrot", "S", "Parrot(Staging)"].map((s) => s.toLowerCase()));

function norm(code: string | undefined) {
  return (code ?? "").trim().toLowerCase();
}

function chunk<T>(arr: T[], size: number) {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function findRoleByCode(guild: any, code: string): Role | undefined {
  const key = norm(code);
  return guild.roles.cache.find((r: Role) => norm(r.name) === key);
}

function isAllowedLangRole(guildId: string, role: Role) {
  if (role.id === guildId) return false;
  if (role.managed) return false;
  if (EXCLUDED_ROLE_NAMES.has(norm(role.name))) return false;
  return true;
}

function getLangRolesInGuild(guild: any, botTopPos: number): Role[] {
  const out: Role[] = [];
  for (const code of LANG_CODES) {
    const r = findRoleByCode(guild, code);
    if (!r) continue;
    if (!isAllowedLangRole(guild.id, r)) continue;
    if (r.position >= botTopPos) continue;
    out.push(r);
  }
  return out;
}

export const data = new SlashCommandBuilder()
  .setName("langpanel")
  .setDescription("Post language target role panel")
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

    const rows = chunk([...LANG_CODES], 5).map((codes) => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const code of codes) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`lang:set:${code}`)
            .setLabel(code.toUpperCase())
            .setStyle(code === "en" ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );
      }
      return row;
    });

    const content = [
      "Pick your target language role.",
      "You can only have one language role at a time.",
      "Default is EN (if you have none).",
    ].join("\n");

    return interaction.reply({ content, components: rows });
  },
};

export async function handleLangButtons(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton()) return false;

  const btn = interaction as ButtonInteraction;

  const [p0, p1, p2] = btn.customId.split(":");
  if (p0 !== "lang" || p1 !== "set") return false;

  const raw = p2;
  if (!raw) return false;

  const code = norm(raw);
  if (!LANG_CODES.includes(code as LangCode)) return false;

  if (!btn.inGuild() || !btn.guild) {
    await btn.reply({ content: "This action can only be used in a guild.", flags: MessageFlags.Ephemeral });
    return true;
  }

  const me = btn.guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await btn.reply({ content: "Bot is missing Manage Roles permission.", flags: MessageFlags.Ephemeral });
    return true;
  }

  await btn.deferReply({ flags: MessageFlags.Ephemeral });

  const targetRole = findRoleByCode(btn.guild, code);
  if (!targetRole) {
    await btn.editReply({ content: `Role not found for: ${code}` });
    return true;
  }

  if (!isAllowedLangRole(btn.guild.id, targetRole)) {
    await btn.editReply({ content: "This role cannot be assigned." });
    return true;
  }

  if (targetRole.position >= me.roles.highest.position) {
    await btn.editReply({ content: "Bot role must be above the target language roles." });
    return true;
  }

  const member = await btn.guild.members.fetch(btn.user.id);

  const langRoles = getLangRolesInGuild(btn.guild, me.roles.highest.position);
  const langRoleIds = new Set(langRoles.map((r) => r.id));

  const toRemove = member.roles.cache
    .filter((r) => langRoleIds.has(r.id) && r.id !== targetRole.id)
    .map((r) => r.id);

  try {
    if (toRemove.length) await member.roles.remove(toRemove, "Language target selection");
    if (!member.roles.cache.has(targetRole.id)) await member.roles.add(targetRole.id, "Language target selection");
    await btn.editReply({ content: `Target language set to: ${code.toUpperCase()}` });
  } catch {
    await btn.editReply({ content: "Failed to update roles. Check bot role position and permissions." });
  }

  return true;
}
