import { vi } from 'vitest'
import { BaseProvider } from '../lib/providers/BaseProvider'
import {
  AgentStatus,
  AgentType,
  MessageType,
  type Agent,
  type AgentCapability,
  type Message,
} from '../lib/types/core'
import type { ModelResponse, StreamChunk } from '../lib/types/models'

// Mock Provider for testing
export class MockProvider extends BaseProvider {
  constructor(name = 'mock') {
    super(name)
  }

  async initialize(): Promise<void> { }

  async generate(prompt: string): Promise<ModelResponse> {
    return {
      content: `Mock response to: ${prompt}`,
      model: 'mock-model',
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    }
  }

  async *generateStream(prompt: string): AsyncGenerator<StreamChunk> {
    yield {
      text: `Mock stream response to: ${prompt}`,
      isComplete: false,
    }
    yield {
      text: '',
      isComplete: true,
    }
  }

  async isAvailable(): Promise<boolean> {
    return true
  }
}

// Mock Agent for testing
export class MockAgent implements Agent {
  private capabilities: AgentCapability[] = []

  getId(): string {
    return 'mock-agent'
  }

  getName(): string {
    return 'Mock Agent'
  }

  getType(): AgentType {
    return AgentType.SPECIALIST
  }

  getStatus(): AgentStatus {
    return AgentStatus.IDLE
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities
  }

  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.some(cap => cap.name === capability.name)
  }

  addCapability(capability: AgentCapability): void {
    this.capabilities.push(capability)
  }

  removeCapability(capability: AgentCapability): void {
    this.capabilities = this.capabilities.filter(cap => cap.name !== capability.name)
  }

  getMetrics() {
    return {
      lastExecutionTime: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
    }
  }

  async handleMessage(_message: Message) {
    return { success: true }
  }

  async processMessage(_message: Message): Promise<void> { }

  async handleRequest(request: unknown): Promise<unknown> {
    return request
  }

  async handleToolUse(_tool: unknown) {
    return { status: 'success', data: null }
  }
}

// Message creation utility
export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'test-id',
  type: MessageType.TASK,
  content: 'test content',
  timestamp: Date.now(),
  ...overrides
})

// Network mocking utilities
export const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

export const mockResponse = (body: unknown) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

export const mockErrorResponse = (status = 500, statusText = 'Internal Server Error') => {
  return Promise.resolve({
    ok: false,
    status,
    statusText,
    text: () => Promise.resolve(statusText),
  } as Response)
};

// Test wrapper for async operations
export const waitForOperation = async <T>(operation: Promise<T>, timeout = 1000) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeout)
  })
  return Promise.race([operation, timeoutPromise])
}

// Reset all mocks between tests
export const resetMocks = () => {
  vi.clearAllMocks()
  mockFetch.mockReset()
}

// Create a mock stream reader
export const createMockStreamReader = (chunks: string[]) => {
  let index = 0
  return {
    read: async () => {
      if (index >= chunks.length) {
        return { done: true as const, value: undefined }
      }
      const value = new TextEncoder().encode(chunks[index])
      index += 1
      return { done: false as const, value }
    },
    cancel: vi.fn(),
    releaseLock: vi.fn(),
  }
}
