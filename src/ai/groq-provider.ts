import Groq from 'groq-sdk';

export interface AIProviderOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  error?: string;
}

export class GroqProvider {
  private client: Groq;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(options: AIProviderOptions) {
    if (!options.apiKey) {
      throw new Error('Groq API key is required');
    }

    this.client = new Groq({
      apiKey: options.apiKey,
    });

    this.model = options.model || 'mixtral-8x7b-32768';
    this.maxTokens = options.maxTokens || 150;
    this.temperature = options.temperature || 0.7;
  }

  async generateResponse(message: string, systemPrompt: string): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content || '';

      if (!content.trim()) {
        return {
          content: '',
          error: 'Empty response from Groq',
        };
      }

      return {
        content: content.trim(),
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Groq API error:', errorMessage);
      return {
        content: '',
        error: errorMessage,
      };
    }
  }

  async generateResponseWithContext(
    message: string,
    systemPrompt: string,
    context: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...context.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content || '';

      if (!content.trim()) {
        return {
          content: '',
          error: 'Empty response from Groq',
        };
      }

      return {
        content: content.trim(),
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Groq API error:', errorMessage);
      return {
        content: '',
        error: errorMessage,
      };
    }
  }
}
