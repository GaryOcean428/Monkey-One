import { vi } from 'vitest';
import { MessageType, AgentType, AgentStatus, type Message, type Agent, type AgentCapability } from '../lib/types/core';
import { BaseProvider } from '../lib/providers/BaseProvider';
import { ModelResponse, StreamChunk } from '../lib/types/models';

// Mock Provider for testing
export class MockProvider extends BaseProvider {
  constructor(name = 'mock') {
    super(name);
  }

  async initialize(): Promise<void> {}

  async generate(prompt: string): Promise<ModelResponse> {
    return { text: `Mock response to: ${prompt}` };
  }

  async *generateStream(prompt: string): AsyncGenerator<StreamChunk> {
    yield { text: `Mock stream response to: ${prompt}` };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// Mock Agent for testing
export class MockAgent implements Agent {
  id = 'mock-agent';
  type = AgentType.SPECIALIST;
  capabilities: AgentCapability[] = [];
  status = AgentStatus.AVAILABLE;

  async initialize(): Promise<void> {}
  
  async processMessage(message: Message): Promise<void> {
    // Implementation for testing
  }
  
  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  hasCapability(name: string): boolean {
    return this.capabilities.some(cap => cap.name === name);
  }
  
  addCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }
  
  removeCapability(name: string): void {
    this.capabilities = this.capabilities.filter(cap => cap.name !== name);
  }
  
  async shutdown(): Promise<void> {}
}

// Message creation utility
export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'test-id',
  type: MessageType.TASK,
  role: 'user',
  content: 'test content',
  timestamp: Date.now(),
  ...overrides
});

// Network mocking utilities
export const mockFetch = vi.fn();
global.fetch = mockFetch;

export const mockResponse = (body: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body))
  });
};

export const mockErrorResponse = (status = 500, statusText = 'Internal Server Error') => {
  return Promise.resolve({
    ok: false,
    status,
    statusText,
    text: () => Promise.resolve(statusText)
  });
};

// Test wrapper for async operations
export const waitForOperation = async (operation: Promise<any>, timeout = 1000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeout);
  });
  return Promise.race([operation, timeoutPromise]);
};

// Reset all mocks between tests
export const resetMocks = () => {
  vi.clearAllMocks();
  mockFetch.mockReset();
};

// Create a mock stream reader
export const createMockStreamReader = (chunks: string[]) => {
  let index = 0;
  return {
    read: async () => {
      if (index >= chunks.length) {
        return { done: true, value: undefined };
      }
      const value = new TextEncoder().encode(chunks[index]);
      index++;
      return { done: false, value };
    },
    cancel: vi.fn(),
    releaseLock: vi.fn(),
  };
};
