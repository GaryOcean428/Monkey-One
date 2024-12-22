import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';

export class CoderAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'coder', [
      'code_writing',
      'code_analysis',
      'code_execution'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      await memoryManager.add({
        type: 'user-message',
        content: message.content,
        tags: ['user-input', 'code-request']
      });

      const response = await this.generateResponse(message.content);
      return this.createResponse(response);
    } catch (error) {
      console.error('Error in CoderAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your coding request. Please try again.'
      );
    }
  }

  private async generateResponse(content: string): Promise<string> {
    return `I understand you want help with code: "${content}". Code assistance capabilities are being implemented.`;
  }
}