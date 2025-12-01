import "dotenv/config";

interface EnvironmentConfig {
  token: string;
  clientId: string;
  guildId?: string;
}

function validateEnv(): EnvironmentConfig {
  const token = process.env.TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!clientId) {
    throw new Error("Missing required environment variable: CLIENT_ID");
  }

  return {
    token,
    clientId,
    guildId,
  };
}

export const env = validateEnv();