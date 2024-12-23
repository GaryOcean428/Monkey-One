export class AgentError extends Error {
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    public readonly code: string = 'AGENT_ERROR',
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AgentError';
    this.details = details;
  }
}

export class InitializationError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'INIT_ERROR', details);
    this.name = 'InitializationError';
  }
}

export class MessageError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'MESSAGE_ERROR', details);
    this.name = 'MessageError';
  }
}

export class ToolError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'TOOL_ERROR', details);
    this.name = 'ToolError';
  }
}

export class ValidationError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RuntimeError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'RUNTIME_ERROR', details);
    this.name = 'RuntimeError';
  }
}

export class SecurityError extends AgentError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

export function handleError(error: unknown): AgentError {
  if (error instanceof AgentError) {
    return error;
  }
  if (error instanceof Error) {
    return new AgentError(error.message, 'UNKNOWN_ERROR', {
      originalError: error.name,
      stack: error.stack
    });
  }
  return new AgentError(String(error), 'UNKNOWN_ERROR', {
    originalError: error
  });
}

export function isAgentError(error: unknown): error is AgentError {
  return error instanceof AgentError;
}
