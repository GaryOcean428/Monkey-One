import { BrowserTool } from '../../../lib/tools/web/BrowserTool';
import { ToolExecutionError } from '../../../lib/errors/AgentErrors';

interface BrowserState {
  url: string;
  title: string;
  content: string;
  links: Array<{ text: string; url: string }>;
  timestamp: number;
  userAgent: string;
  viewport?: { width: number; height: number };
  screenshot?: string;
  screenshotFormat?: string;
  screenshotTimestamp?: string;
  clickTarget?: string;
  inputSelector?: string;
  inputText?: string;
  scrollPosition?: number;
  closedAt?: string;
  [key: string]: unknown;
}

describe('BrowserTool', () => {
  const browser = BrowserTool.create();

  describe('action validation', () => {
    it('should require an action type', async () => {
      await expect(browser.execute({}))
        .rejects.toThrow('Action type is required');
    });

    it('should validate unknown action types', async () => {
      await expect(browser.execute({ 
        action: { type: 'invalid' } 
      })).rejects.toThrow('Unsupported browser action: invalid');
    });

    it('should require URL for launch action', async () => {
      await expect(browser.execute({ 
        action: { type: 'launch' } 
      })).rejects.toThrow('URL is required for launch action');
    });

    it('should validate URL format', async () => {
      await expect(browser.execute({ 
        action: { type: 'launch', url: 'invalid-url' } 
      })).rejects.toThrow('Invalid URL format');
    });
  });

  describe('browser actions', () => {
    it('should launch browser with URL', async () => {
      const result = await browser.execute({
        action: { type: 'launch', url: 'https://example.com' }
      }) as BrowserState;

      expect(result).toMatchObject({
        url: 'https://example.com',
        title: expect.any(String),
        content: expect.any(String),
        links: expect.any(Array),
        timestamp: expect.any(Number),
        userAgent: expect.any(String)
      });
    });

    it('should navigate to new URL', async () => {
      const result = await browser.execute({
        action: { type: 'navigate', url: 'https://example.com/page' }
      }) as BrowserState;

      expect(result).toMatchObject({
        url: 'https://example.com/page',
        title: expect.any(String),
        links: expect.arrayContaining([
          expect.objectContaining({
            text: expect.any(String),
            url: expect.any(String)
          })
        ])
      });
    });

    it('should click with selector', async () => {
      const result = await browser.execute({
        action: { type: 'click', selector: '#button' }
      }) as BrowserState;

      expect(result).toMatchObject({
        clickTarget: '#button',
        url: expect.any(String),
        title: expect.any(String)
      });
    });

    it('should click with coordinates', async () => {
      const result = await browser.execute({
        action: { type: 'click', coordinates: { x: 100, y: 200 } }
      }) as BrowserState;

      expect(result).toMatchObject({
        clickTarget: '100,200',
        url: expect.any(String),
        title: expect.any(String)
      });
    });

    it('should validate click coordinates', async () => {
      await expect(browser.execute({
        action: { 
          type: 'click',
          coordinates: { x: -1, y: 0 }
        }
      })).rejects.toThrow('Invalid click coordinates');
    });

    it('should type text into element', async () => {
      const result = await browser.execute({
        action: { 
          type: 'type',
          selector: '#input',
          text: 'Hello World'
        }
      }) as BrowserState;

      expect(result).toMatchObject({
        inputSelector: '#input',
        inputText: 'Hello World',
        url: expect.any(String)
      });
    });

    it('should scroll page', async () => {
      const result = await browser.execute({
        action: { type: 'scroll', scrollAmount: 500 }
      }) as BrowserState;

      expect(result).toMatchObject({
        scrollPosition: 500,
        url: expect.any(String)
      });
    });

    it('should take screenshot', async () => {
      const result = await browser.execute({
        action: { type: 'screenshot' }
      }) as BrowserState;

      expect(result).toMatchObject({
        screenshot: expect.any(String),
        screenshotFormat: 'png',
        screenshotTimestamp: expect.any(String)
      });
    });

    it('should close browser', async () => {
      const result = await browser.execute({
        action: { type: 'close' }
      }) as BrowserState;

      expect(result).toMatchObject({
        url: '',
        title: '',
        content: 'Browser closed',
        closedAt: expect.any(String)
      });
    });
  });

  describe('error handling', () => {
    it('should handle type validation errors', async () => {
      await expect(browser.execute({
        action: { 
          type: 'type',
          text: 123 
        }
      })).rejects.toThrow('Text must be a string');
    });

    it('should handle missing required parameters', async () => {
      await expect(browser.execute({
        action: { 
          type: 'type'
        }
      })).rejects.toThrow('Missing required parameters');
    });

    it('should handle scroll amount validation', async () => {
      await expect(browser.execute({
        action: { 
          type: 'scroll',
          scrollAmount: 'invalid'
        }
      })).rejects.toThrow('Invalid scroll amount');
    });

    it('should include error details in error state', async () => {
      try {
        await browser.execute({
          action: { type: 'invalid' }
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ToolExecutionError);
        expect(error.details).toEqual({
          action: 'invalid',
          error: 'Unsupported browser action: invalid'
        });
      }
    });
  });

  describe('state validation', () => {
    it('should validate link structure', async () => {
      const result = await browser.execute({
        action: { type: 'launch', url: 'https://example.com' }
      }) as BrowserState;

      expect(result.links).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.any(String),
            url: expect.stringMatching(/^https?:\/\//)
          })
        ])
      );
    });

    it('should include common state properties', async () => {
      const result = await browser.execute({
        action: { type: 'launch', url: 'https://example.com' }
      }) as BrowserState;

      expect(result).toMatchObject({
        timestamp: expect.any(Number),
        userAgent: expect.stringContaining('Mozilla'),
        viewport: {
          width: expect.any(Number),
          height: expect.any(Number)
        }
      });
    });

    it('should maintain state structure across actions', async () => {
      const actions = [
        { type: 'launch' as const, url: 'https://example.com' },
        { type: 'click' as const, selector: '#button' },
        { type: 'type' as const, selector: '#input', text: 'test' }
      ];

      for (const action of actions) {
        const result = await browser.execute({ action }) as BrowserState;
        expect(result).toMatchObject({
          url: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
          links: expect.any(Array),
          timestamp: expect.any(Number)
        });
      }
    });
  });
});
