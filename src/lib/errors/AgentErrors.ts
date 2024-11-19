interface ErrorMetadata {
  toolName?: string;
  errorType?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export class AgentExecutionError extends Error {
  metadata: ErrorMetadata;
  
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message);
    this.name = 'AgentExecutionError';
    this.metadata = metadata;
  }
}

// For backward compatibility
export const ToolExecutionError = AgentExecutionError;

export class MessageRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageRoutingError';
  }
}