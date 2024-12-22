import { FunctionTool } from '../FunctionTool';
import { Tool } from '../../../types';
import { ToolExecutionError } from '../../errors/AgentErrors';
import { ToolResultHandling } from '../ToolResultHandling';

interface BrowserAction {
  type: 'launch' | 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'close';
  url?: string;
  selector?: string;
  text?: string;
  coordinates?: { x: number; y: number };
  scrollAmount?: number;
}

interface Link {
  text: string;
  url: string;
}

interface BrowserState extends Record<string, unknown> {
  url: string;
  title: string;
  content: string;
  screenshot?: string;
  links: Link[];
  error?: string;
  [key: string]: unknown;
}

export class BrowserTool {
  static create(): Tool {
    return ToolResultHandling.withObjectResult<BrowserState>(
      FunctionTool.withValidation(
        async (args: Record<string, unknown>) => {
          const action = args.action as BrowserAction;
          
          try {
            // In a real implementation, this would use Puppeteer or similar
            // For now, we'll simulate browser behavior
            const baseState: Partial<BrowserState> = {
              timestamp: Date.now(),
              userAgent: 'Mozilla/5.0 (Mock Browser)',
              viewport: { width: 1024, height: 768 }
            };

            switch (action.type) {
              case 'launch':
                if (!action.url) {
                  throw new Error('URL is required for launch action');
                }
                return {
                  ...baseState,
                  url: action.url,
                  title: 'Page Title',
                  content: 'Page content...',
                  links: [
                    { text: 'Link 1', url: 'https://example.com/1' },
                    { text: 'Link 2', url: 'https://example.com/2' }
                  ]
                } as BrowserState;

              case 'navigate':
                if (!action.url) {
                  throw new Error('URL is required for navigate action');
                }
                return {
                  ...baseState,
                  url: action.url,
                  title: 'New Page Title',
                  content: 'New page content...',
                  links: [
                    { text: 'Link 3', url: 'https://example.com/3' },
                    { text: 'Link 4', url: 'https://example.com/4' }
                  ]
                } as BrowserState;

              case 'click':
                if (!action.selector && !action.coordinates) {
                  throw new Error('Either selector or coordinates required for click action');
                }
                return {
                  ...baseState,
                  url: 'https://example.com/clicked',
                  title: 'Clicked Page',
                  content: 'Page after click...',
                  links: [],
                  clickTarget: action.selector || `${action.coordinates?.x},${action.coordinates?.y}`
                } as BrowserState;

              case 'type':
                if (!action.selector || !action.text) {
                  throw new Error('Selector and text required for type action');
                }
                return {
                  ...baseState,
                  url: 'https://example.com/typed',
                  title: 'Form Page',
                  content: `Typed: ${action.text}`,
                  links: [],
                  inputSelector: action.selector,
                  inputText: action.text
                } as BrowserState;

              case 'scroll':
                return {
                  ...baseState,
                  url: 'https://example.com/scrolled',
                  title: 'Scrolled Page',
                  content: 'Content after scroll...',
                  links: [],
                  scrollPosition: action.scrollAmount || 0
                } as BrowserState;

              case 'screenshot':
                return {
                  ...baseState,
                  url: 'https://example.com/current',
                  title: 'Current Page',
                  content: 'Current content...',
                  screenshot: 'base64-encoded-image-data',
                  links: [],
                  screenshotFormat: 'png',
                  screenshotTimestamp: new Date().toISOString()
                } as BrowserState;

              case 'close':
                return {
                  ...baseState,
                  url: '',
                  title: '',
                  content: 'Browser closed',
                  links: [],
                  closedAt: new Date().toISOString()
                } as BrowserState;

              default:
                throw new Error(`Unknown browser action: ${action.type}`);
            }
          } catch (error) {
            const errorState: BrowserState = {
              url: '',
              title: 'Error',
              content: 'An error occurred',
              links: [],
              error: error instanceof Error ? error.message : String(error),
              errorTimestamp: new Date().toISOString(),
              errorType: error instanceof Error ? error.constructor.name : typeof error
            };
            
            throw new ToolExecutionError(
              `Browser action failed: ${errorState.error}`,
              {
                toolName: 'browser',
                action: action.type,
                url: action.url,
                errorType: errorState.errorType as string
              }
            );
          }
        },
        {
          name: 'browser',
          description: 'Controls a web browser for web interaction',
          required: ['action'],
          validate: (args: Record<string, unknown>) => {
            const action = args.action as BrowserAction;
            if (!action || !action.type) {
              throw new Error('Invalid browser action');
            }

            // Validate action-specific requirements
            switch (action.type) {
              case 'launch':
              case 'navigate':
                if (!action.url) {
                  throw new Error('URL is required');
                }
                if (!action.url.startsWith('http')) {
                  throw new Error('URL must start with http:// or https://');
                }
                break;

              case 'click':
                if (!action.selector && !action.coordinates) {
                  throw new Error('Either selector or coordinates required');
                }
                if (action.coordinates) {
                  const { x, y } = action.coordinates;
                  if (typeof x !== 'number' || typeof y !== 'number') {
                    throw new Error('Coordinates must be numbers');
                  }
                  if (x < 0 || y < 0) {
                    throw new Error('Coordinates must be positive');
                  }
                }
                break;

              case 'type':
                if (!action.selector || !action.text) {
                  throw new Error('Selector and text required');
                }
                if (typeof action.text !== 'string') {
                  throw new Error('Text must be a string');
                }
                break;

              case 'scroll':
                if (action.scrollAmount !== undefined && typeof action.scrollAmount !== 'number') {
                  throw new Error('Scroll amount must be a number');
                }
                break;
            }
          }
        }
      ),
      {
        url: (value): boolean => typeof value === 'string',
        title: (value): boolean => typeof value === 'string',
        content: (value): boolean => typeof value === 'string',
        links: (value): boolean => 
          Array.isArray(value) && 
          value.every(link => 
            typeof link === 'object' && 
            link !== null &&
            typeof (link as Link).text === 'string' && 
            typeof (link as Link).url === 'string'
          )
      }
    );
  }
}
