export interface ErrorDetails {
  code?: string;
  details?: Record<string, unknown>;
}

export class AgentError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AgentError';
    this.code = code || 'AGENT_ERROR';
    this.details = details;
  }
}

export class InitializationError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INITIALIZATION_ERROR', details);
    this.name = 'InitializationError';
  }
}

export class MessageError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'MESSAGE_ERROR', details);
    this.name = 'MessageError';
  }
}

export class ToolError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TOOL_ERROR', details);
    this.name = 'ToolError';
  }
}

export class ToolExecutionError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TOOL_EXECUTION_ERROR', details);
    this.name = 'ToolExecutionError';
  }
}

export class AgentExecutionError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AGENT_EXECUTION_ERROR', details);
    this.name = 'AgentExecutionError';
  }
}

export class ValidationError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RuntimeError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'RUNTIME_ERROR', details);
    this.name = 'RuntimeError';
  }
}

export class SecurityError extends AgentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

export function isAgentError(error: unknown): error is AgentError {
  return error instanceof AgentError;
}

export function handleError(error: unknown): void {
  if (isAgentError(error)) {
    console.error(`${error.name}: ${error.message}`);
    // Add any additional error handling logic here
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
