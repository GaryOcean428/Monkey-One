import { BaseRuntime } from './BaseRuntime';

export class HostAgentRuntime extends BaseRuntime {
  private readonly address: string;

  constructor(address: string) {
    super();
    this.address = address;
  }

  async start(): Promise<void> {
    // ...host service logic...
  }

  async stop(): Promise<void> {
    // ...stop service logic...
  }
}