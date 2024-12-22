import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';

export class FileSurferAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'filesurfer', [
      'file_reading',
      'file_writing',
      'directory_navigation'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      await memoryManager.add({
        type: 'user-message',
        content: message.content,
        tags: ['user-input', 'file-request']
      });

      const response = await this.generateResponse(message.content);
      return this.createResponse(response);
    } catch (error) {
      console.error('Error in FileSurferAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your file operation request. Please try again.'
      );
    }
  }

  private async generateResponse(content: string): Promise<string> {
    return `I understand you want to work with files: "${content}". File operation capabilities are being implemented.`;
  }
}