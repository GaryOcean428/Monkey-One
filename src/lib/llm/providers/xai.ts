import type { LLMProvider } from './index';
import type { Message } from '@/types';

export class XAIProvider implements LLMProvider {
  readonly id = 'xai';
  readonly name = 'X.AI';

  constructor(private apiKey: string) {}

  async sendMessage(message: string, context: Message[] = []): Promise<string> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        messages: [
          ...context.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        model: 'grok-beta',
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`X.AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async streamResponse(message: string, onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        model: 'grok-beta',
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`X.AI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream not available');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    }
  }
}