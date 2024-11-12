import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';

interface FileAction {
  type: 'read' | 'write' | 'list' | 'search';
  data: {
    path?: string;
    content?: string;
    query?: string;
    pattern?: string;
  };
}

export class FileSurferAgent extends BaseAgent {
  private currentDirectory: string | null = null;

  constructor(id: string, name: string) {
    super(id, name, 'FileSurfer', [
      'file_reading',
      'file_writing',
      'directory_navigation',
      'content_search'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Parse the requested file action
      const action = await this.parseFileAction(message.content);

      // Store action in memory
      await memoryManager.add({
        type: 'file-action',
        content: JSON.stringify(action),
        tags: ['file-action', action.type]
      });

      // Execute the file action
      const result = await this.executeFileAction(action);

      // Store result in memory
      await memoryManager.add({
        type: 'file-result',
        content: result,
        tags: ['file-result', action.type]
      });

      return this.createResponse(result);
    } catch (error) {
      const errorMessage = `Error executing file action: ${(error as Error).message}`;
      
      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error', 'file-error']
      });

      return this.createResponse(errorMessage);
    }
  }

  private async parseFileAction(content: string): Promise<FileAction> {
    const systemPrompt = `You are a file action parser. Analyze the following request and extract:
1. The type of file action needed (read, write, list, search)
2. The relevant data for that action (path, content, query, pattern)

Valid action types:
- read: Requires a file path
- write: Requires a file path and content
- list: Optionally takes a directory path
- search: Requires a search query and optionally a file pattern`;

    const analysis = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content }
    ]);

    try {
      // Extract action from the analysis
      const parsed = JSON.parse(analysis);
      if (!parsed.type || !parsed.data) {
        throw new Error('Invalid action format');
      }
      return parsed as FileAction;
    } catch (error) {
      throw new Error(`Failed to parse file action: ${(error as Error).message}`);
    }
  }

  private async executeFileAction(action: FileAction): Promise<string> {
    const listPath = action.data.path || this.currentDirectory || '.';

    switch (action.type) {
      case 'read':
        if (!action.data.path) {
          throw new Error('Path required for read action');
        }
        // TODO: Implement actual file reading
        return `Read file content from ${action.data.path}`;

      case 'write':
        if (!action.data.path || !action.data.content) {
          throw new Error('Path and content required for write action');
        }
        // TODO: Implement actual file writing
        return `Wrote content to ${action.data.path}`;

      case 'list':
        // TODO: Implement actual directory listing
        return `Listed contents of directory ${listPath}`;

      case 'search':
        if (!action.data.query) {
          throw new Error('Query required for search action');
        }
        // TODO: Implement actual file search
        return `Searched for "${action.data.query}"${action.data.pattern ? ` matching pattern ${action.data.pattern}` : ''}`;

      default:
        throw new Error(`Unsupported file action type: ${action.type}`);
    }
  }

  private normalizePath(inputPath: string): string {
    // Remove any parent directory traversal
    const normalized = inputPath.replace(/\.\./g, '');
    // Remove any double slashes
    return normalized.replace(/\/\//g, '/');
  }
}
