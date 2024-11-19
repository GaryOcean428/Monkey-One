export class AgentExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentExecutionError';
  }
}

export class MessageRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageRoutingError';
  }
}