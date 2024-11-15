import {
  AgentError,
  InitializationError,
  MessageError,
  ToolError,
  ValidationError,
  RuntimeError,
  SecurityError,
  isAgentError,
  handleError
} from '@/lib/errors/AgentErrors'

describe('AgentErrors', () => {
  describe('AgentError', () => {
    it('should create base error with correct properties', () => {
      const error = new AgentError('Test error', 'TEST_ERROR', { foo: 'bar' })
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.details).toEqual({ foo: 'bar' })
      expect(error.name).toBe('AgentError')
    })
  })

  describe('Specialized Error Types', () => {
    it('should create InitializationError with correct properties', () => {
      const error = new InitializationError('Init failed', { reason: 'test' })
      expect(error.message).toBe('Init failed')
      expect(error.code).toBe('INIT_ERROR')
      expect(error.details).toEqual({ reason: 'test' })
      expect(error.name).toBe('InitializationError')
    })

    it('should create MessageError with correct properties', () => {
      const error = new MessageError('Invalid message', { id: '123' })
      expect(error.message).toBe('Invalid message')
      expect(error.code).toBe('MESSAGE_ERROR')
      expect(error.details).toEqual({ id: '123' })
      expect(error.name).toBe('MessageError')
    })

    it('should create ToolError with correct properties', () => {
      const error = new ToolError('Tool failed', { toolId: 'test' })
      expect(error.message).toBe('Tool failed')
      expect(error.code).toBe('TOOL_ERROR')
      expect(error.details).toEqual({ toolId: 'test' })
      expect(error.name).toBe('ToolError')
    })

    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input', { field: 'name' })
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual({ field: 'name' })
      expect(error.name).toBe('ValidationError')
    })

    it('should create RuntimeError with correct properties', () => {
      const error = new RuntimeError('Runtime error', { operation: 'test' })
      expect(error.message).toBe('Runtime error')
      expect(error.code).toBe('RUNTIME_ERROR')
      expect(error.details).toEqual({ operation: 'test' })
      expect(error.name).toBe('RuntimeError')
    })

    it('should create SecurityError with correct properties', () => {
      const error = new SecurityError('Access denied', { userId: '123' })
      expect(error.message).toBe('Access denied')
      expect(error.code).toBe('SECURITY_ERROR')
      expect(error.details).toEqual({ userId: '123' })
      expect(error.name).toBe('SecurityError')
    })
  })

  describe('isAgentError', () => {
    it('should return true for AgentError instances', () => {
      const error = new AgentError('Test', 'TEST')
      expect(isAgentError(error)).toBe(true)
    })

    it('should return true for specialized error instances', () => {
      const error = new InitializationError('Test')
      expect(isAgentError(error)).toBe(true)
    })

    it('should return false for standard Error', () => {
      const error = new Error('Test')
      expect(isAgentError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isAgentError('string')).toBe(false)
      expect(isAgentError(123)).toBe(false)
      expect(isAgentError({})).toBe(false)
      expect(isAgentError(null)).toBe(false)
      expect(isAgentError(undefined)).toBe(false)
    })
  })

  describe('handleError', () => {
    it('should return original error if it is an AgentError', () => {
      const originalError = new AgentError('Test', 'TEST')
      const handledError = handleError(originalError)
      expect(handledError).toBe(originalError)
    })

    it('should wrap standard Error in AgentError', () => {
      const originalError = new Error('Test')
      const handledError = handleError(originalError)
      expect(handledError).toBeInstanceOf(AgentError)
      expect(handledError.code).toBe('UNKNOWN_ERROR')
      expect(handledError.details?.originalError).toBeDefined()
    })

    it('should handle non-error values', () => {
      const handledError = handleError('not an error')
      expect(handledError).toBeInstanceOf(AgentError)
      expect(handledError.code).toBe('UNKNOWN_ERROR')
      expect(handledError.details?.originalError).toBe('not an error')
    })
  })
})
