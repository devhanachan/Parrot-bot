import { Events } from "discord.js";
import type { Event } from "../types";

const URL_REGEX = /https?:\/\/[^\s]+/gi;

const event: Event<"messageCreate"> = {
  name: Events.MessageCreate,
  once: false,

  async execute(message) {
    if (message.author.bot) {
      return;
    }

    if (!URL_REGEX.test(message.content)) {
      return;
    }

    if (!message.channel.isSendable()) {
      return;
    }

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