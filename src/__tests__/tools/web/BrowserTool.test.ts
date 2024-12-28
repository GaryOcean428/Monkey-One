import { expect, describe, it, beforeEach } from 'vitest';
import { BrowserTool } from '../../../lib/tools/web/BrowserTool';

describe('BrowserTool', () => {
  let browserTool: BrowserTool;

  beforeEach(() => {
    browserTool = new BrowserTool();
  });

  describe('action validation', () => {
    it('should require an action type', async () => {
      await expect(browserTool.execute({} as any))
        .rejects.toThrow('Action type is required');
    });

    it('should validate unknown action types', async () => {
      await expect(browserTool.execute({ action: 'invalid' } as any))
        .rejects.toThrow('Unsupported browser action: invalid');
    });

    it('should require URL for launch action', async () => {
      await expect(browserTool.execute({ action: 'launch' }))
        .rejects.toThrow('URL is required for launch action');
    });

    it('should validate URL format', async () => {
      await expect(browserTool.execute({ 
        action: 'launch', 
        url: 'not-a-url' 
      })).rejects.toThrow('Invalid URL format');
    });
  });

  describe('browser actions', () => {
    it('should validate click coordinates', async () => {
      await expect(browserTool.execute({
        action: 'click',
        x: 'invalid',
        y: 100
      } as any)).rejects.toThrow('Invalid click coordinates');
    });
  });

  describe('error handling', () => {
    it('should handle type validation errors', async () => {
      await expect(browserTool.execute({
        action: 'type',
        text: 123
      } as any)).rejects.toThrow('Text must be a string');
    });

    it('should handle missing required parameters', async () => {
      await expect(browserTool.execute({
        action: 'scroll'
      })).rejects.toThrow('Missing required parameters');
    });

    it('should handle scroll amount validation', async () => {
      await expect(browserTool.execute({
        action: 'scroll',
        amount: 'invalid'
      } as any)).rejects.toThrow('Invalid scroll amount');
    });

    it('should include error details in error state', async () => {
      try {
        await browserTool.execute({ action: 'invalid' });
      } catch (error: any) {
        expect(error.state).toEqual({
          action: 'invalid',
          error: 'Unsupported browser action: invalid'
        });
      }
    });
  });
});
