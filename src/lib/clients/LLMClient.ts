import type { Message } from '../../types';

export class LLMClient {
  constructor(private apiKey: string) {}

  async chat(messages: Message[]): Promise<Message> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async complete(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Error in complete:', error);
      throw error;
    }
  }
}