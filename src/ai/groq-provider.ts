import Groq from 'groq-sdk';

export interface AIProvider {
  generateResponse(message: string, context?: string): Promise<string>;
  isEnabled(): boolean;
}

export class GroqProvider implements AIProvider {
  private client: Groq;
  private enabled: boolean;

  constructor(apiKey: string | undefined) {
    this.enabled = !!apiKey;
    if (apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    if (!this.enabled) {
      throw new Error('Groq AI is not enabled');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const response = await this.client.chat.completions.create({
        model: 'mixtral-8x7b-32768',
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
        max_tokens: 150,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq');
      }

      return content.trim();
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  private buildSystemPrompt(context?: string): string {
    let prompt = `Bạn là một trợ lý thân thiện và hữu ích.`;
    prompt += `\n- Trả lời ngắn gọn (1-3 câu tối đa).`;
    prompt += `\n- Nếu không biết, hãy nói "Mình không biết, xin lỗi bạn!".`;
    prompt += `\n- Giữ tính cách thân thiện, tự nhiên.`;
    prompt += `\n- Trả lời bằng tiếng Việt.`;

    if (context) {
      prompt += `\n\nBối cảnh: ${context}`;
    }

    return prompt;
  }
}
