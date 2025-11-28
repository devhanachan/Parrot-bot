import { describe, it } from "vitest";
import { command } from "../commands/translate";

describe("translate command (real API + console output)", () => {
  it("translates text and logs output", async () => {
    // Minimal fake interaction object
    const interaction: any = {
      options: {
        getString(name: string) {
          if (name === "msg") return "Hello world"; // text to translate
          if (name === "langcode") return "es";     // target language
          return null;
        },
      },
      deferReply: async () => console.log("[Interaction] deferReply called"),
      editReply: async (msg: string) => console.log("[Interaction] editReply:", msg),
    };

    // Execute the command
    await command.execute(interaction);
  });
});
