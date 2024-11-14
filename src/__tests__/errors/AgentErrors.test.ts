import {
  AgentError,
  AgentExecutionError,
  MessageRoutingError,
  ValidationError,
  SecurityError,
  isAgentError,
  wrapError,
  ErrorDetails
} from '../../lib/errors/AgentErrors';

describe('AgentErrors', () => {
  describe('AgentError', () => {
    it('should create base error with correct properties', () => {
      const details: ErrorDetails = { foo: 'bar' };
      const error = new AgentError('test message', 'TEST_CODE', details);

      expect(error.message).toBe('test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual(details);
      expect(error.name).toBe('AgentError');
      expect(error.stack).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new AgentError('test message', 'TEST_CODE');
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AgentError',
        message: 'test message',
        code: 'TEST_CODE',
        details: undefined,
        stack: error.stack
      });
    });
  });

  describe('Specific Error Types', () => {
    it('should create AgentExecutionError correctly', () => {
      const error = new AgentExecutionError('execution failed');
      expect(error.code).toBe('AGENT_EXECUTION_ERROR');
      expect(error instanceof AgentError).toBe(true);
    });

    it('should create MessageRoutingError correctly', () => {
      const error = new MessageRoutingError('routing failed');
      expect(error.code).toBe('MESSAGE_ROUTING_ERROR');
      expect(error instanceof AgentError).toBe(true);
    });

    it('should create ValidationError correctly', () => {
      const error = new ValidationError('validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error instanceof AgentError).toBe(true);
    });

    it('should create SecurityError correctly', () => {
      const error = new SecurityError('security check failed');
      expect(error.code).toBe('SECURITY_ERROR');
      expect(error instanceof AgentError).toBe(true);
    });
  });

  describe('isAgentError', () => {
    it('should return true for AgentError instances', () => {
      expect(isAgentError(new AgentError('test', 'TEST'))).toBe(true);
      expect(isAgentError(new AgentExecutionError('test'))).toBe(true);
    });

    it('should return false for non-AgentError instances', () => {
      expect(isAgentError(new Error('test'))).toBe(false);
      expect(isAgentError('string')).toBe(false);
      expect(isAgentError(null)).toBe(false);
      expect(isAgentError(undefined)).toBe(false);
    });
  });

  describe('wrapError', () => {
    it('should return original error if already AgentError', () => {
      const original = new AgentExecutionError('test');
      expect(wrapError(original)).toBe(original);
    });

    it('should wrap Error instance', () => {
      const error = new Error('test');
      const wrapped = wrapError(error);

      expect(wrapped instanceof AgentError).toBe(true);
      expect(wrapped.message).toBe('test');
      expect(wrapped.code).toBe('UNKNOWN_ERROR');
    });

    it('should wrap non-Error values', () => {
      const wrapped1 = wrapError('string error');
      expect(wrapped1.message).toBe('string error');

      const wrapped2 = wrapError({ custom: 'error' });
      expect(wrapped2.message).toBe('[object Object]');
      expect(wrapped2.details?.originalError).toBe('{"custom":"error"}');
    });

    it('should use custom error code', () => {
      const wrapped = wrapError(new Error('test'), 'CUSTOM_ERROR');
      expect(wrapped.code).toBe('CUSTOM_ERROR');
    });

    it('should handle null and undefined', () => {
      const wrapped1 = wrapError(null);
      expect(wrapped1.message).toBe('null');

      const wrapped2 = wrapError(undefined);
      expect(wrapped2.message).toBe('undefined');
    });
  });

  describe('Error inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const error = new AgentExecutionError('test');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AgentError).toBe(true);
      expect(error instanceof AgentExecutionError).toBe(true);
    });

    it('should preserve stack trace', () => {
      const error = new AgentExecutionError('test');
      expect(error.stack).toBeDefined();
      expect(error.stack?.includes('AgentExecutionError')).toBe(true);
    });
  });
});
