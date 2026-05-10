import 'dotenv/config';

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  telegram: {
    token: requireEnv('TG_TOKEN'),
    groupId: Number(requireEnv('TG_GROUP_ID')),
  },
  zalo: {
    credentialsPath: process.env.ZALO_CREDENTIALS_PATH ?? './credentials.json',
  },
  dataDir: process.env.DATA_DIR ?? './data',
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    groqApiKey: optionalEnv('GROQ_API_KEY', ''),
    groqModel: optionalEnv('GROQ_MODEL', 'mixtral-8x7b-32768'),
    style: optionalEnv('AI_STYLE', 'friendly'),
  },
  autoReply: {
    enabled: process.env.AUTO_REPLY_ENABLED === 'true',
    delayMs: Number(process.env.AUTO_REPLY_DELAY_MS ?? '1000'),
    respondToMentions: process.env.AUTO_REPLY_RESPOND_TO_MENTIONS !== 'false',
    respondToQuestions: process.env.AUTO_REPLY_RESPOND_TO_QUESTIONS !== 'false',
    respondToRandomMessages: process.env.AUTO_REPLY_RESPOND_TO_RANDOM !== 'false',
    randomChance: Number(process.env.AUTO_REPLY_RANDOM_CHANCE ?? '0.3'),
  },
} as const;

// Validate AI config if enabled
if (config.ai.enabled) {
  if (!config.ai.groqApiKey) {
    console.warn(
      'Warning: AI_ENABLED=true but GROQ_API_KEY is not set. AI features will be disabled.'
    );
  }
}
