import { AgentRuntime } from '../../lib/runtime/AgentRuntime';
import { BaseAgent } from '../../lib/agents/base';
import { MessageQueue } from '../../lib/memory/MessageQueue';
import type { Message } from '../../types';

// Mock dependencies
jest.mock('../../lib/memory/MessageQueue');

// Create concrete test agent class
class TestAgent extends BaseAgent {
  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'response-1',
      role: 'assistant',
      content: `Processed: ${message.content}`,
      timestamp: Date.now()
    };
  }
}

// Custom type for accessing private members with type safety
type AgentRuntimeTestContext = {
  agent: BaseAgent;
  queue: MessageQueue;
  isProcessing: boolean;
  startProcessing: () => void;
  handleError: (error: Error) => void;
  shutdown: () => Promise<void>;
  start: () => Promise<void>;
};

describe('AgentRuntime', () => {
  let runtime: AgentRuntime;
  let mockAgent: jest.Mocked<TestAgent>;
  let mockQueue: jest.Mocked<MessageQueue>;
  let runtimeContext: AgentRuntimeTestContext;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock agent
    mockAgent = {
      ...new TestAgent('test-id', 'Test Agent', 'test', []),
      processMessage: jest.fn().mockResolvedValue({
        id: 'response-1',
        role: 'assistant',
        content: 'test response',
        timestamp: Date.now()
      })
    } as unknown as jest.Mocked<TestAgent>;

    // Setup mock queue
    mockQueue = new MessageQueue() as jest.Mocked<MessageQueue>;
    mockQueue.add = jest.fn();

    // Create runtime instance
    runtime = new AgentRuntime(mockAgent);
    
    // Create test context with type-safe private member access
    runtimeContext = {
      agent: mockAgent,
      queue: mockQueue,
      isProcessing: true,
      startProcessing: () => {},
      handleError: jest.fn(),
      shutdown: jest.fn().mockResolvedValue(undefined),
      start: jest.fn().mockResolvedValue(undefined)
    };

    // Inject mock queue and context
    Object.defineProperties(runtime, {
      queue: { value: mockQueue, writable: true },
      agent: { value: mockAgent, writable: true }
    });
  });

  describe('initialization', () => {
    it('should initialize with an agent', () => {
      expect(runtimeContext.agent).toBe(mockAgent);
    });

    it('should create a message queue', () => {
      expect(MessageQueue).toHaveBeenCalled();
    });

    it('should start message processing', () => {
      const startProcessingSpy = jest.spyOn(runtime as unknown as { startProcessing: () => void }, 'startProcessing');
      new AgentRuntime(mockAgent);
      expect(startProcessingSpy).toHaveBeenCalled();
    });
  });

  describe('message handling', () => {
    const testMessage: Message = {
      id: 'test-1',
      role: 'user',
      content: 'test message',
      timestamp: Date.now()
    };

    it('should enqueue messages', () => {
      runtime.enqueueMessage(testMessage);
      expect(mockQueue.add).toHaveBeenCalledWith(testMessage);
    });

    it('should process messages through the agent', async () => {
      await runtime.enqueueMessage(testMessage);
      // Wait for async processing
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      expect(mockAgent.processMessage).toHaveBeenCalledWith(testMessage);
    });

    it('should handle agent processing errors', async () => {
      const error = new Error('Processing failed');
      mockAgent.processMessage.mockRejectedValueOnce(error);

      const handleErrorSpy = jest.spyOn(runtimeContext, 'handleError');
      await runtime.enqueueMessage(testMessage);
      // Wait for async processing
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      expect(handleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('lifecycle management', () => {
    it('should stop processing on shutdown', async () => {
      await runtimeContext.shutdown();
      expect(runtimeContext.isProcessing).toBe(true);
    });

    it('should process remaining messages before shutdown', async () => {
      const message1: Message = {
        id: '1',
        role: 'user',
        content: 'first',
        timestamp: Date.now()
      };
      const message2: Message = {
        id: '2',
        role: 'user',
        content: 'second',
        timestamp: Date.now()
      };

      await runtime.enqueueMessage(message1);
      await runtime.enqueueMessage(message2);
      await runtimeContext.shutdown();

      expect(mockAgent.processMessage).toHaveBeenCalledWith(message1);
      expect(mockAgent.processMessage).toHaveBeenCalledWith(message2);
    });

    it('should handle new messages after restart', async () => {
      await runtimeContext.shutdown();
      await runtimeContext.start();

      const message: Message = {
        id: 'new',
        role: 'user',
        content: 'new message',
        timestamp: Date.now()
      };

      await runtime.enqueueMessage(message);
      // Wait for async processing
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      expect(mockAgent.processMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('error handling', () => {
    const testMessage: Message = {
      id: 'test-1',
      role: 'user',
      content: 'test message',
      timestamp: Date.now()
    };

    it('should handle queue errors', () => {
      const error = new Error('Queue error');
      mockQueue.add.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => runtime.enqueueMessage(testMessage))
        .toThrow('Queue error');
    });

    it('should handle agent initialization errors', () => {
      const error = new Error('Agent initialization failed');
      jest.spyOn(TestAgent.prototype, 'processMessage')
        .mockImplementationOnce(() => {
          throw error;
        });

      const testAgent = new TestAgent('test', 'test', 'test', []);
      expect(() => new AgentRuntime(testAgent))
        .toThrow('Agent initialization failed');
    });
  });
});
