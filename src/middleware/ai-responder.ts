import { GroqProvider } from '../ai/groq-provider';
import { getSystemPrompt } from '../ai/prompt-templates';

export interface AIResponderOptions {
  enabled: boolean;
  groqProvider: GroqProvider;
  style: string;
  delayMs: number;
  respondToMentions: boolean;
  respondToQuestions: boolean;
  respondToRandomMessages: boolean;
  randomChance: number;
  cooldownMs: number;
  maxHistory: number;
  allowedThreads: readonly string[];
}

interface HistoryItem { role: 'user' | 'assistant'; content: string }

export class AIResponder {
  private enabled: boolean;
  private groqProvider: GroqProvider;
  private style: string;
  private delayMs: number;
  private respondToMentions: boolean;
  private respondToQuestions: boolean;
  private respondToRandomMessages: boolean;
  private randomChance: number;
  private cooldownMs: number;
  private maxHistory: number;
  private allowedThreads: Set<string>;

  // per-thread state
  private lastReplyAt = new Map<string, number>();
  private history    = new Map<string, HistoryItem[]>();

  constructor(options: AIResponderOptions) {
    this.enabled = options.enabled;
    this.groqProvider = options.groqProvider;
    this.style = options.style || 'friendly';
    this.delayMs = options.delayMs ?? 1500;
    this.respondToMentions = options.respondToMentions !== false;
    this.respondToQuestions = options.respondToQuestions !== false;
    this.respondToRandomMessages = options.respondToRandomMessages === true;
    this.randomChance = Math.min(Math.max(options.randomChance ?? 0.05, 0), 1);
    this.cooldownMs = Math.max(options.cooldownMs ?? 15000, 0);
    this.maxHistory = Math.max(options.maxHistory ?? 6, 0);
    this.allowedThreads = new Set(options.allowedThreads ?? []);
  }

  isEnabled(): boolean { return this.enabled; }
  setEnabled(v: boolean) { this.enabled = v; }
  getStyle() { return this.style; }
  setStyle(s: string) { this.style = s; }

  private isThreadAllowed(threadId: string): boolean {
    if (this.allowedThreads.size === 0) return true;
    return this.allowedThreads.has(threadId);
  }

  private isInCooldown(threadId: string): boolean {
    const last = this.lastReplyAt.get(threadId);
    if (!last) return false;
    return Date.now() - last < this.cooldownMs;
  }

  /**
   * Decide whether bot should reply to this message.
   */
  shouldRespond(
    message: string,
    opts: {
      threadId: string;
      isMention?: boolean;
      isCommand?: boolean;
      isFromSelf?: boolean;
      minLength?: number;
    },
  ): boolean {
    if (!this.enabled) return false;
    if (opts.isFromSelf) return false;             // chống loop
    if (opts.isCommand || message.startsWith('/')) return false;
    if (message.trim().length < (opts.minLength ?? 3)) return false;
    if (!this.isThreadAllowed(opts.threadId)) return false;
    if (this.isInCooldown(opts.threadId)) return false;

    if (opts.isMention && this.respondToMentions) return true;
    if (this.respondToQuestions && /[?？]/.test(message)) return true;
    if (this.respondToRandomMessages && Math.random() < this.randomChance) return true;
    return false;
  }

  private pushHistory(threadId: string, item: HistoryItem) {
    if (this.maxHistory === 0) return;
    const arr = this.history.get(threadId) ?? [];
    arr.push(item);
    while (arr.length > this.maxHistory * 2) arr.shift();
    this.history.set(threadId, arr);
  }

  /** Generate a reply with delay + cooldown + history context. */
  async generateReply(threadId: string, userText: string): Promise<string | null> {
    try {
      // Mark cooldown immediately to avoid concurrent replies
      this.lastReplyAt.set(threadId, Date.now());
      if (this.delayMs > 0) await new Promise(r => setTimeout(r, this.delayMs));

      const systemPrompt = getSystemPrompt(this.style);
      const ctx = this.history.get(threadId) ?? [];
      const resp = await this.groqProvider.generateResponseWithContext(
        userText, systemPrompt, ctx,
      );
      if (resp.error || !resp.content) {
        if (resp.error) console.error('[AI] error:', resp.error);
        return null;
      }
      this.pushHistory(threadId, { role: 'user', content: userText });
      this.pushHistory(threadId, { role: 'assistant', content: resp.content });
      this.lastReplyAt.set(threadId, Date.now());
      return resp.content;
    } catch (e) {
      console.error('[AI] exception:', e);
      return null;
    }
  }
}
