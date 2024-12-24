# Testing Guidelines

## Test Categories

### Unit Tests
- Use Vitest as the test runner
- Mock external dependencies (Firebase, GitHub, etc.)
- Test individual components in isolation
- Focus on behavior verification

### Integration Tests
- Test component interactions
- Verify agent communication
- Test memory system integration
- Validate workflow execution

### Performance Tests
- Monitor response times
- Track memory usage
- Measure learning efficiency
- Validate resource optimization

### Behavior Tests
- Verify agent capabilities
- Test emotional processing
- Validate learning patterns
- Check error handling

## Testing Standards

### Mocking
- Use Vitest mocks
- Mock external APIs and services
- Provide realistic test data
- Simulate error conditions

### Assertions
- Use Vitest expect statements
- Test both success and failure cases
- Verify state changes
- Check error handling

### Test Environment
- Configure jsdom for UI tests
- Mock browser APIs when needed
- Reset state between tests
- Clean up resources

### Required Testing Dependencies
- @testing-library/react for React component testing
- @tensorflow/tfjs for ML-related tests
- firebase/storage and firebase/firestore for Firebase tests

### Test Setup
- Project uses Vitest, not Jest
- Import test utilities from 'vitest' not 'jest'
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Test files must import { expect, describe, it, beforeEach } from 'vitest'
- Type errors in test files do not prevent dev server from running

### UI Component Structure
- Split complex components into Content and Container components
- Content component handles data fetching and error states
- Container component provides layout and error boundaries
- Always wrap data fetching components with error boundaries
- Include loading states for async operations
- Add ARIA labels for accessibility

### UI Component Testing
- Test loading states using vi.mock() for data fetching hooks
- Test error states by throwing errors in mocked hooks
- Test accessibility by verifying ARIA attributes
- Test component rendering in both light and dark themes
- Test responsive layouts at different breakpoints
- Verify error boundary fallback rendering
- Test suspense boundary loading states

### Testing Setup
- @testing-library/react and @testing-library/jest-dom are already installed
- Use render() from @testing-library/react for component testing
- Use screen queries like getByText(), getByRole() for assertions
- Mock store dependencies using vi.mock()
- Wrap components with necessary providers (ThemeProvider, SettingsProvider)
- Test ARIA attributes and accessibility features
- Import '@testing-library/jest-dom' in setupTests.ts
- Extend Vitest expect with @testing-library/jest-dom matchers
- Mock browser APIs (TextDecoder, canvas) in setupTests.ts
- Use vi.mock() for external dependencies

### Test Environment Setup
Required in setupTests.ts:
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {...});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(...);

// Mock TextDecoder and canvas
// ... other browser API mocks
```

### UI Component Patterns
- Split data fetching components into Content/Container pattern
- Content component:
  - Handles data fetching logic
  - Manages loading states
  - Throws errors for error boundary
  - Returns JSX for rendering
- Container component:
  - Provides error boundaries
  - Handles suspense boundaries
  - Sets up layout and accessibility
  - Minimal logic, mostly composition
- Always include:
  - Role and aria-label attributes
  - Loading states with LoadingSpinner
  - Error boundaries with ToolhouseErrorBoundary
  - Suspense boundaries for code splitting

### Settings Panel Structure
- Group settings by category (General, LLM, Agent)
- Each category in its own Card component
- Use consistent spacing (space-y-4 for form groups)
- Provide immediate feedback for changes
- Include reset functionality
- Support both light and dark themes
- Use semantic HTML (labels, aria-labels)
- Handle all form control types:
  - Switch for boolean values
  - Select for enumerated values
  - Input for numbers with min/max
  - Input for text with validation

### Message Testing
When creating test messages, always include all required fields:
```typescript
const testMessage = {
  id: string;
  type: MessageType;  // Must use MessageType enum (e.g., MessageType.TASK), not string literals
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  metadata?: Record<string, unknown>;
};
```

### Agent Testing
When working with agents, always use the proper enums and implement all required interface methods:

- Use `AgentType` enum for agent types:
  - `AgentType.ORCHESTRATOR`
  - `AgentType.WORKER`
  - `AgentType.SPECIALIST`
- Use `AgentStatus` enum for agent status:
  - `AgentStatus.AVAILABLE`
  - `AgentStatus.BUSY`
  - `AgentStatus.OFFLINE`
- Use `MessageType` enum for message types:
  - `MessageType.TASK`
  - `MessageType.RESPONSE`
  - `MessageType.ERROR`
  - `MessageType.BROADCAST`
  - `MessageType.HANDOFF`

### Mock Agent Implementation
When creating mock agents for tests:
```typescript
class MockAgent implements Agent {
  id: string;
  type = AgentType.SPECIALIST;
  capabilities = [] as AgentCapability[];  // Use type assertion for empty arrays
  status = AgentStatus.AVAILABLE;

  constructor(id: string) {
    this.id = id;
  }

  async initialize(): Promise<void> {}
  
  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'response',
      type: MessageType.RESPONSE,
      role: 'assistant',
      content: 'Test response',
      timestamp: Date.now()
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  registerCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }

  async handleMessage(message: Message): Promise<Message> {
    return this.processMessage(message);
  }
}
```

### Required Agent Interface Methods
All agents must implement:
- initialize(): Setup agent state
- processMessage(): Core message processing
- getCapabilities(): Return list of capabilities
- registerCapability(): Add new capability
- handleMessage(): High-level message handling

### Message Testing
When creating test messages, always include all required fields:
```typescript
const testMessage = {
  id: string;
  type: MessageType;  // Must use MessageType enum (e.g., MessageType.TASK), not string literals
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};
```

### Agent Metrics Testing
When testing agent metrics:
- Test all metric fields: messageCount, errorCount, averageResponseTime, status
- Use exact equality for counts and status
- Use approximate equality for time-based metrics
- Test metric updates after operations
- Verify metric persistence
- Test metric aggregation

### Agent Handoff Testing
When testing agent handoffs:
- Mock memory manager for storing handoff context
- Test capability detection
- Verify context preservation during handoffs
- Test error recovery scenarios
- Validate agent selection logic
- Use MessageType.HANDOFF for handoff messages

Example mock agent:
```typescript
class MockAgent implements Agent {
  id = 'mock-agent';
  name = 'Mock Agent';
  type = AgentType.ORCHESTRATOR;
  status = AgentStatus.IDLE;
  capabilities = [{ name: 'test', description: 'Test capability' }];

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  registerCapability(capability: AgentCapability): void {
    this.capabilities.push(capability);
  }
}
```

### CI/CD Integration
- Run tests in GitHub Actions
- Generate coverage reports
- Enforce minimum coverage
- Block merges on test failures
- Use GH_TOKEN instead of GITHUB_TOKEN for Vercel deployments to avoid conflicts
