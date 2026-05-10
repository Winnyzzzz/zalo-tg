export { AIResponder, type AIResponderOptions } from './ai-responder';

import { AIResponder } from './ai-responder';
import { GroqProvider } from '../ai/groq-provider';
import { config } from '../config';

let _instance: AIResponder | null = null;

/** Lazily build the singleton AI responder if AI is configured. */
export function getAIResponder(): AIResponder | null {
  if (_instance) return _instance;
  if (!config.ai.enabled || !config.ai.groqApiKey) return null;
  const groq = new GroqProvider({
    apiKey: config.ai.groqApiKey,
    model: config.ai.groqModel,
  });
  _instance = new AIResponder({
    enabled: config.autoReply.enabled,
    groqProvider: groq,
    style: config.ai.style,
    delayMs: config.autoReply.delayMs,
    respondToMentions: config.autoReply.respondToMentions,
    respondToQuestions: config.autoReply.respondToQuestions,
    respondToRandomMessages: config.autoReply.respondToRandomMessages,
    randomChance: config.autoReply.randomChance,
    cooldownMs: config.autoReply.cooldownMs,
    maxHistory: config.ai.maxHistory,
    allowedThreads: config.autoReply.allowedThreads,
  });
  console.log(
    `[AI] Auto-reply ready (model=${config.ai.groqModel}, style=${config.ai.style}, ` +
    `enabled=${config.autoReply.enabled}, randomChance=${config.autoReply.randomChance})`,
  );
  return _instance;
}
