import { Tool } from '../../../types';
import { ToolExecutionError } from '../../errors/AgentErrors';

export class BrowserTool {
  async execute(args: {
    action: string;
    url?: string;
    selector?: string;
    text?: string;
    x?: number;
    y?: number;
    amount?: number;
  }): Promise<any> {
    if (!args.action) {
      throw new ToolExecutionError('Action type is required', {
        toolName: 'browser',
        state: { error: 'Missing action type' }
      });
    }

    switch (args.action) {
      case 'launch':
        if (!args.url) {
          throw new ToolExecutionError('URL is required for launch action', {
            toolName: 'browser',
            state: { action: args.action, error: 'Missing URL' }
          });
        }
        if (!args.url.match(/^https?:\/\/.+/)) {
          throw new ToolExecutionError('Invalid URL format', {
            toolName: 'browser',
            state: { action: args.action, url: args.url }
          });
        }
        return { url: args.url };

      case 'click':
        if (args.x !== undefined && args.y !== undefined) {
          if (typeof args.x !== 'number' || typeof args.y !== 'number') {
            throw new ToolExecutionError('Invalid click coordinates', {
              toolName: 'browser',
              state: { action: args.action, x: args.x, y: args.y }
            });
          }
        } else if (!args.selector) {
          throw new ToolExecutionError('Missing required parameters', {
            toolName: 'browser',
            state: { action: args.action, error: 'Missing selector or coordinates' }
          });
        }
        return { clicked: args.selector || `${args.x},${args.y}` };

      case 'type':
        if (!args.text || typeof args.text !== 'string') {
          throw new ToolExecutionError('Text must be a string', {
            toolName: 'browser',
            state: { action: args.action, error: 'Invalid text' }
          });
        }
        return { typed: args.text };

      case 'scroll':
        if (!args.amount) {
          throw new ToolExecutionError('Missing required parameters', {
            toolName: 'browser',
            state: { action: args.action, error: 'Missing scroll amount' }
          });
        }
        if (typeof args.amount !== 'number') {
          throw new ToolExecutionError('Invalid scroll amount', {
            toolName: 'browser',
            state: { action: args.action, amount: args.amount }
          });
        }
        return { scrolled: args.amount };

      default:
        throw new ToolExecutionError(`Unsupported browser action: ${args.action}`, {
          toolName: 'browser',
          state: {
            action: args.action,
            error: `Unsupported browser action: ${args.action}`
          }
        });
    }
  }
}
