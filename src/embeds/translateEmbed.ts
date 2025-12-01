import { EmbedBuilder } from "discord.js";
import type { TranslateEmbedOptions } from "../types";

export function createTranslateEmbed(options: TranslateEmbedOptions): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Translation Result")
    .addFields(
      { name: "From", value: options.from, inline: true },
      { name: "To", value: options.to, inline: true },
      { name: "Translated Text", value: options.result || "No translation available" }
    )
    .setColor(0x5865f2);
}