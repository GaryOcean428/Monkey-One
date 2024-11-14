/**
 * Type definition for error details
 */
export interface ErrorDetails {
  [key: string]: string | number | boolean | null | undefined | ErrorDetails;
}

/**
 * Base class for all agent-related errors
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Creates a structured error object for logging/serialization
   */
  toJSON(): ErrorDetails {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack || ''
    };
  }
}

/**
 * Error thrown during agent execution
 */
export class AgentExecutionError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'AGENT_EXECUTION_ERROR', details);
  }
}

/**
 * Error thrown during message routing
 */
export class MessageRoutingError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'MESSAGE_ROUTING_ERROR', details);
  }
}

/**
 * Error thrown when agent initialization fails
 */
export class AgentInitializationError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'AGENT_INIT_ERROR', details);
  }
}

/**
 * Error thrown when tool execution fails
 */
export class ToolExecutionError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'TOOL_EXECUTION_ERROR', details);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

/**
 * Error thrown when a security check fails
 */
export class SecurityError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'SECURITY_ERROR', details);
  }
}

/**
 * Error thrown when state management fails
 */
export class StateError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'STATE_ERROR', details);
  }
}

/**
 * Error thrown when memory operations fail
 */
export class MemoryError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'MEMORY_ERROR', details);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'CONFIG_ERROR', details);
  }
}

/**
 * Error thrown when a timeout occurs
 */
export class TimeoutError extends AgentError {
  constructor(
    message: string,
    details?: ErrorDetails
  ) {
    super(message, 'TIMEOUT_ERROR', details);
  }
}

/**
 * Helper function to determine if an error is an AgentError
 */
export function isAgentError(error: unknown): error is AgentError {
  return error instanceof AgentError;
}

/**
 * Helper function to wrap unknown errors as AgentErrors
 */
export function wrapError(error: unknown, code = 'UNKNOWN_ERROR'): AgentError {
  if (isAgentError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new AgentError(message, code, {
    originalError: typeof error === 'object' ? JSON.stringify(error) : String(error)
  });
}
