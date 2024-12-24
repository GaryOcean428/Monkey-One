import { describe, it, expect } from 'vitest';
import { SecurityMiddleware } from '../../lib/middleware/SecurityMiddleware';
import { Message, MessageType } from '../../types';

describe('SecurityMiddleware', () => {
  const middleware = new SecurityMiddleware();

  describe('validateMessage', () => {
    it('should validate valid message', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: 'Hello',
        timestamp: Date.now()
      };

      expect(middleware.validateMessage(message)).toBe(true);
    });

    it('should reject message with invalid role', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'invalid' as any,
        content: 'Hello',
        timestamp: Date.now()
      };

      expect(middleware.validateMessage(message)).toBe(false);
    });

    it('should reject message exceeding length limit', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: 'a'.repeat(11000),
        timestamp: Date.now()
      };

      expect(middleware.validateMessage(message)).toBe(false);
    });

    it('should reject message with missing required fields', () => {
      const message = {
        id: '123',
        type: MessageType.TASK,
        content: 'Hello'
      } as Message;

      expect(middleware.validateMessage(message)).toBe(false);
    });
  });

  describe('sanitizeMessage', () => {
    it('should sanitize HTML in content', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: '<script>alert("xss")</script>Hello',
        timestamp: Date.now()
      };

      const sanitized = middleware.sanitizeMessage(message);
      expect(sanitized.content).not.toContain('<script>');
      expect(sanitized.content).toContain('Hello');
    });

    it('should remove javascript: URLs', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: 'javascript:alert("xss")',
        timestamp: Date.now()
      };

      const sanitized = middleware.sanitizeMessage(message);
      expect(sanitized.content).not.toContain('javascript:');
    });

    it('should remove onerror attributes', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: '<img onerror="alert(1)" src="x">',
        timestamp: Date.now()
      };

      const sanitized = middleware.sanitizeMessage(message);
      expect(sanitized.content).not.toContain('onerror');
    });

    it('should preserve safe HTML elements', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: '<p>Safe paragraph</p><br><b>Bold text</b>',
        timestamp: Date.now()
      };

      const sanitized = middleware.sanitizeMessage(message);
      expect(sanitized.content).toContain('<p>');
      expect(sanitized.content).toContain('<br>');
      expect(sanitized.content).toContain('<b>');
    });

    it('should handle nested malicious content', () => {
      const message: Message = {
        id: '123',
        type: MessageType.TASK,
        role: 'user',
        content: '<div onclick="javascript:alert(1)" style="background: url(javascript:alert(2))">Test</div>',
        timestamp: Date.now()
      };

      const sanitized = middleware.sanitizeMessage(message);
      expect(sanitized.content).not.toContain('onclick');
      expect(sanitized.content).not.toContain('javascript:');
      expect(sanitized.content).toContain('Test');
    });
  });
});
