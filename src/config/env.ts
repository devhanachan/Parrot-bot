import "dotenv/config";

interface EnvironmentConfig {
  token: string;
  clientId: string;
  guildId?: string;
  debugtoken: string;
}

function validateEnv(): EnvironmentConfig {
  const token = process.env.TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;
  const debugtoken = process.env.DEBUG_TOKEN;

  if (!token) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!clientId) {
    throw new Error("Missing required environment variable: CLIENT_ID");
  }

  if (!debugtoken) {
    throw new Error("Messing requred environment variable: DEBUG_TOKEN");
  }

  return {
    token,
    clientId,
    guildId,
    debugtoken,
  };
}

export const env = validateEnv();