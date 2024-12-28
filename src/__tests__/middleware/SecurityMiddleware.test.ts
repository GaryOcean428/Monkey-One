import { describe, it, expect } from 'vitest';
import { SecurityMiddleware } from '../../lib/middleware/SecurityMiddleware';
import { MessageType, type Message } from '../../lib/types/core';
import { createMockMessage } from '../../test/test-utils';

describe('SecurityMiddleware', () => {
  const middleware = new SecurityMiddleware();

  it('validates a valid message', () => {
    const message = createMockMessage({
      type: MessageType.TASK,
      content: 'test content'
    });

    expect(middleware.validateMessage(message)).toBe(true);
  });

  it('invalidates message with invalid role', () => {
    const message = createMockMessage({
      role: 'invalid' as any
    });

    expect(middleware.validateMessage(message)).toBe(false);
  });

  it('invalidates message exceeding max length', () => {
    const message = createMockMessage({
      content: 'a'.repeat(11000)
    });

    expect(middleware.validateMessage(message)).toBe(false);
  });

  it('sanitizes message content', () => {
    const message = createMockMessage({
      content: '<script>alert("xss")</script>'
    });

    const sanitized = middleware.sanitizeMessage(message);
    expect(sanitized.content).not.toContain('<script>');
  });
});
