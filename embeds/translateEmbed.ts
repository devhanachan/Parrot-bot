import { EmbedBuilder } from "discord.js";

export function createTranslateEmbed(opts: {
  from: string;
  to: string;
  result: string;
}) {
  return new EmbedBuilder()
    .setTitle("Translation Result")
    .addFields(
      { name: "From", value: opts.from, inline: true },
      { name: "To", value: opts.to, inline: true },
      { name: "Translated Text", value: opts.result }
    )
    .setColor("Blue");
}

