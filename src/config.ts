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
    // mixtral-8x7b-32768 đã bị Groq deprecate. Dùng Llama 3.3 70B versatile mặc định.
    groqModel: optionalEnv('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    style: optionalEnv('AI_STYLE', 'friendly'),
    maxHistory: Number(process.env.AI_MAX_HISTORY ?? '6'),
  },
  autoReply: {
    enabled: process.env.AUTO_REPLY_ENABLED === 'true',
    delayMs: Number(process.env.AUTO_REPLY_DELAY_MS ?? '1500'),
    respondToMentions: process.env.AUTO_REPLY_RESPOND_TO_MENTIONS !== 'false',
    respondToQuestions: process.env.AUTO_REPLY_RESPOND_TO_QUESTIONS !== 'false',
    // Mặc định TẮT random reply để bot không spam nhóm
    respondToRandomMessages: process.env.AUTO_REPLY_RESPOND_TO_RANDOM === 'true',
    randomChance: Number(process.env.AUTO_REPLY_RANDOM_CHANCE ?? '0.05'),
    cooldownMs: Number(process.env.AUTO_REPLY_COOLDOWN_MS ?? '15000'),
    // Chỉ trả lời trong các thread (zaloId) liệt kê (csv). Trống = mọi thread.
    allowedThreads: (process.env.AUTO_REPLY_ALLOWED_THREADS ?? '')
      .split(',').map(s => s.trim()).filter(Boolean),
  },
} as const;

if (config.ai.enabled && !config.ai.groqApiKey) {
  console.warn('Warning: AI_ENABLED=true but GROQ_API_KEY is not set. AI features disabled.');
}
