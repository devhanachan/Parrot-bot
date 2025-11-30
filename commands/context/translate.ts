import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import type { MessageContextMenuCommandInteraction, Role } from "discord.js";

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

const TRANSLATE_TARGET: Record<LangCode, string> = {
  en: "en",
  th: "th",
  ja: "ja",
  fil: "fil",
  id: "id",
  "ar-eg": "ar",
  ak: "ak",
  ee: "ee",
  gaa: "gaa",
  dag: "dag",
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

function detectTargetFromRoles(roles: readonly Role[] | any): LangCode {
  const names = new Set<string>(roles.map((r: Role) => norm(r.name)));
  for (const code of LANG_CODES) {
    if (names.has(code)) return code;
  }
  return "en";
}

async function googleTranslateGtx(text: string, target: string) {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&dj=1&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) throw new Error(`Translate HTTP ${res.status}`);

  const data = (await res.json()) as any;

  const sentences = Array.isArray(data?.sentences) ? data.sentences : [];
  const translated = sentences.map((s: any) => String(s?.trans ?? "")).join("");
  const detected = typeof data?.src === "string" ? data.src : "auto";

  return { translatedText: translated.trim(), detectedSource: detected };
}

function cut(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export const data = new ContextMenuCommandBuilder()
  .setName("Translate (Target Role)")
  .setType(ApplicationCommandType.Message);

export default {
  data,
  async execute(interaction: MessageContextMenuCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "Guild only.", flags: MessageFlags.Ephemeral });
      return;
    }

    const msg = interaction.targetMessage;
    const text = msg?.content?.trim() ?? "";
    if (!text) {
      await interaction.reply({ content: "No text to translate.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = interaction.member;
    const roles = (member && "roles" in member) ? (member.roles as any).cache?.values?.() : null;
    const roleArr: Role[] = roles ? [...roles] : [];

    const langCode = detectTargetFromRoles(roleArr);
    const target = TRANSLATE_TARGET[langCode] ?? "en";

    try {
      const { translatedText, detectedSource } = await googleTranslateGtx(text, target);

      await interaction.editReply({ content: translatedText});
    } catch (e) {
      await interaction.editReply({ content: "Translate failed." });
    }
  },
};
