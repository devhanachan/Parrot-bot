import { Events } from "discord.js";
import type { Event } from "../types";

const URL_REGEX = /https?:\/\/[^\s<>()]+/gi;
const ALLOWED_DOMAINS = ["tenor.com", "discord.com", "github.com"];

const ALLOWED_ROLES = [
  "123456789012345678",
  "987654321098765432",
];

function isAllowedHost(hostname: string) {
  const h = hostname.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => h === d || h.endsWith("." + d));
}

function messageHasBlockedUrl(content: string) {
  const matches = [...content.matchAll(URL_REGEX)].map((m) => m[0]);
  if (matches.length === 0) return false;

  return matches.some((raw) => {
    try {
      const u = new URL(raw);
      return !isAllowedHost(u.hostname);
    } catch {
      return true;
    }
  });
}

const event: Event<"messageCreate"> = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) return;
    if (!message.channel.isSendable()) return;
    if (!message.guild) return;

    if (!messageHasBlockedUrl(message.content)) return;

    const member = message.member;
    if (!member) return;

    const hasAllowedRole = member.roles.cache.some((role) =>
      ALLOWED_ROLES.includes(role.id),
    );
    if (hasAllowedRole) return;

    try {
      await message.delete();
      await message.channel.send({
        content: `⚠️ URL detected!\n<@${message.author.id}>, sending URLs is not allowed here!`,
      });
    } catch (error) {
      console.error("Failed to handle URL message:", error);
    }
  },
};

export default event;
