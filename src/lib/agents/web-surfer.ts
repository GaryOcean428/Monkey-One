import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';

interface WebAction {
  type: 'navigate' | 'click' | 'type' | 'read' | 'search';
  data: {
    url?: string;
    selector?: string;
    text?: string;
    query?: string;
  };
}

export class WebSurferAgent extends BaseAgent {
  private currentUrl: string | null = null;

  constructor(id: string, name: string) {
    super(id, name, 'WebSurfer', [
      'web_navigation',
      'web_interaction',
      'web_search',
      'content_extraction'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Parse the requested web action
      const action = await this.parseWebAction(message.content);

      // Store action in memory
      await memoryManager.add({
        type: 'web-action',
        content: JSON.stringify(action),
        tags: ['web-action', action.type]
      });

      // Execute the web action
      const result = await this.executeWebAction(action);

      // Store result in memory
      await memoryManager.add({
        type: 'web-result',
        content: result,
        tags: ['web-result', action.type]
      });

      return this.createResponse(result);
    } catch (error) {
      const errorMessage = `Error executing web action: ${(error as Error).message}`;
      
      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error', 'web-error']
      });

      return this.createResponse(errorMessage);
    }
  }

  private async parseWebAction(content: string): Promise<WebAction> {
    const systemPrompt = `You are a web action parser. Analyze the following request and extract:
1. The type of web action needed (navigate, click, type, read, search)
2. The relevant data for that action (URL, selector, text, query)

Valid action types:
- navigate: Requires a URL
- click: Requires a selector
- type: Requires a selector and text
- read: Optionally takes a selector
- search: Requires a search query`;

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
      return parsed as WebAction;
    } catch (error) {
      throw new Error(`Failed to parse web action: ${(error as Error).message}`);
    }
  }

  private async executeWebAction(action: WebAction): Promise<string> {
    switch (action.type) {
      case 'navigate':
        if (!action.data.url) {
          throw new Error('URL required for navigation');
        }
        // TODO: Implement actual browser navigation
        this.currentUrl = action.data.url;
        return `Navigated to ${action.data.url}`;

      case 'click':
        if (!action.data.selector) {
          throw new Error('Selector required for click action');
        }
        if (!this.currentUrl) {
          throw new Error('No active page to interact with');
        }
        // TODO: Implement actual click action
        return `Clicked element matching ${action.data.selector}`;

      case 'type':
        if (!action.data.selector || !action.data.text) {
          throw new Error('Selector and text required for type action');
        }
        if (!this.currentUrl) {
          throw new Error('No active page to interact with');
        }
        // TODO: Implement actual typing action
        return `Typed "${action.data.text}" into element matching ${action.data.selector}`;

      case 'read':
        if (!this.currentUrl) {
          throw new Error('No active page to read from');
        }
        // TODO: Implement actual content reading
        return `Read content${action.data.selector ? ` from ${action.data.selector}` : ''} on ${this.currentUrl}`;

      case 'search':
        if (!action.data.query) {
          throw new Error('Query required for search action');
        }
        // TODO: Implement actual web search
        return `Performed search for "${action.data.query}"`;

      default:
        throw new Error(`Unsupported web action type: ${action.type}`);
    }
  }
}
