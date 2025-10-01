// Test utility types and interfaces
export interface MockAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  processMessage?: (message: any) => Promise<any>;
  hasCapability?: (capability: string) => boolean;
  addCapability?: (capability: string) => void;
  removeCapability?: (capability: string) => void;
  shutdown?: () => Promise<void>;
  getId?: () => string;
  getName?: () => string;
  getType?: () => string;
  getStatus?: () => string;
  getCapabilities?: () => string[];
}

export interface TestMessage {
  id: string;
  type: string;
  content: string;
  sender?: string;
  recipient?: string;
  timestamp?: number | Date;
  status?: string;
  role?: string;
  metadata?: any;
}

export interface TestProfile {
  id?: string;
  name: string;
  email: string;
  username?: string;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  preferences?: {
    language: string;
    theme: "system" | "light" | "dark";
    notifications: boolean;
  };
  experiences?: any[];
}

export interface AgentMetrics {
  messageCount?: number;
  errorCount?: number;
  averageResponseTime?: number;
  status?: string;
}

// Utility function for tests
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock implementations
export const createMockAgent = (overrides: Partial<MockAgent> = {}): MockAgent => ({
  id: 'test-agent',
  name: 'Test Agent',
  type: 'test',
  status: 'active',
  processMessage: async (message: any) => message,
  hasCapability: () => true,
  addCapability: () => {},
  removeCapability: () => {},
  shutdown: async () => {},
  getId: () => 'test-agent',
  getName: () => 'Test Agent',
  getType: () => 'test',
  getStatus: () => 'active',
  getCapabilities: () => [],
  ...overrides,
});

export const createTestMessage = (overrides: Partial<TestMessage> = {}): TestMessage => ({
  id: 'test-message',
  type: 'USER',
  content: 'Test message',
  timestamp: Date.now(),
  ...overrides,
});

export const createTestProfile = (overrides: Partial<TestProfile> = {}): TestProfile => ({
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  user_id: 'test-user-id',
  ...overrides,
});