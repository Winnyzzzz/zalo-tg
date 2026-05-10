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
  randomChance: number; // 0-1
}

export class AIResponder {
  private enabled: boolean;
  private groqProvider: GroqProvider;
  private style: string;
  private delayMs: number;
  private respondToMentions: boolean;
  private respondToQuestions: boolean;
  private respondToRandomMessages: boolean;
  private randomChance: number;

  constructor(options: AIResponderOptions) {
    this.enabled = options.enabled;
    this.groqProvider = options.groqProvider;
    this.style = options.style || 'friendly';
    this.delayMs = options.delayMs || 1000;
    this.respondToMentions = options.respondToMentions !== false;
    this.respondToQuestions = options.respondToQuestions !== false;
    this.respondToRandomMessages = options.respondToRandomMessages !== false;
    this.randomChance = Math.min(Math.max(options.randomChance || 0.3, 0), 1);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  shouldRespond(
    message: string,
    options?: {
      isMention?: boolean;
      isCommand?: boolean;
      minLength?: number;
    }
  ): boolean {
    if (!this.enabled) return false;

    const minLength = options?.minLength || 3;
    const isCommand = options?.isCommand || message.startsWith('/');
    const isMention = options?.isMention || false;

    // Never respond to commands
    if (isCommand) return false;

    // Don't respond to very short messages
    if (message.trim().length < minLength) return false;

    // Respond to mentions
    if (isMention && this.respondToMentions) return true;

    // Respond to questions
    if (this.respondToQuestions && (message.includes('?') || message.includes('？'))) {
      return true;
    }

    // Random response
    if (this.respondToRandomMessages && Math.random() < this.randomChance) {
      return true;
    }

    return false;
  }

  async generateResponse(message: string): Promise<string | null> {
    try {
      const systemPrompt = getSystemPrompt(this.style);
      const response = await this.groqProvider.generateResponse(message, systemPrompt);

      if (response.error) {
        console.error('AI Responder error:', response.error);
        return null;
      }

      return response.content || null;
    } catch (error) {
      console.error('AI Responder exception:', error);
      return null;
    }
  }

  async generateResponseWithDelay(message: string): Promise<string | null> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    return this.generateResponse(message);
  }

  setStyle(style: string): void {
    this.style = style;
  }

  getStyle(): string {
    return this.style;
  }

  setDelay(delayMs: number): void {
    this.delayMs = Math.max(delayMs, 0);
  }

  getDelay(): number {
    return this.delayMs;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
