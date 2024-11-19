import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';

export class WebSurferAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'websurfer', [
      'web_navigation',
      'web_interaction',
      'web_search'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      await memoryManager.add({
        type: 'user-message',
        content: message.content,
        tags: ['user-input', 'web-request']
      });

      const response = await this.generateResponse(message.content);
      return this.createResponse(response);
    } catch (error) {
      console.error('Error in WebSurferAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your web request. Please try again.'
      );
    }
  }

  private async generateResponse(content: string): Promise<string> {
    return `I understand you want to interact with the web: "${content}". Web interaction capabilities are being implemented.`;
  }
}