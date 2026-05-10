import { AIProvider } from '../ai/groq-provider';

export interface AIResponderConfig {
  enabled: boolean;
  delayMs: number;
  maxContextLength: number;
}

export class AIResponder {
  private aiProvider: AIProvider;
  private config: AIResponderConfig;
  private messageHistory: Map<string, string[]> = new Map();

  constructor(aiProvider: AIProvider, config: AIResponderConfig) {
    this.aiProvider = aiProvider;
    this.config = config;
  }

  async shouldRespond(
    message: string,
    senderId: string,
    isMention: boolean = false
  ): Promise<boolean> {
    if (!this.config.enabled || !this.aiProvider.isEnabled()) {
      return false;
    }

    // Always respond to mentions
    if (isMention) {
      return true;
    }

    // Don't respond to very short messages
    if (message.length < 3) {
      return false;
    }

    // Don't respond to commands (start with /)
    if (message.startsWith('/')) {
      return false;
    }

    // Respond to questions (contain ?)
    if (message.includes('?')) {
      return true;
    }

    // Random chance to respond to normal messages (30%)
    return Math.random() < 0.3;
  }

  async generateResponse(message: string, senderId: string): Promise<string> {
    const context = this.getContext(senderId);

    try {
      // Add delay to seem more natural
      await new Promise((resolve) => setTimeout(resolve, this.config.delayMs));

      const response = await this.aiProvider.generateResponse(message, context);
      this.addToHistory(senderId, message, response);
      return response;
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw error;
    }
  }

  private getContext(senderId: string): string {
    const history = this.messageHistory.get(senderId) || [];
    return history.slice(-3).join(' | '); // Last 3 messages as context
  }

  private addToHistory(senderId: string, message: string, response: string): void {
    const history = this.messageHistory.get(senderId) || [];
    history.push(`User: ${message}`, `Bot: ${response}`);

    // Keep only last N messages
    if (history.length > this.config.maxContextLength) {
      history.splice(0, history.length - this.config.maxContextLength);
    }

    this.messageHistory.set(senderId, history);
  }
}
