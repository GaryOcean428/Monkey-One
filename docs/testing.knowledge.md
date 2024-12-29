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
- Use ToolExecutionError for tool failures
- Include toolName and state in error details
- Validate all required parameters
- Check parameter types explicitly
- Throw early with clear error messages
- Handle cleanup in error cases

### Test Environment
- Configure jsdom for UI tests
- Mock browser APIs when needed
- Reset state between tests
- Clean up resources

### Required Testing Dependencies
- @testing-library/react for React component testing
- @tensorflow/tfjs for ML-related tests
- firebase/storage and firebase/firestore for Firebase tests

### Model Configuration
- Always use models specified in models.md
- Model tiers:
  - Low tier (simple tasks): granite3.1-dense:2b
  - Mid tier (moderate tasks): claude-3-5-haiku@20241022
  - High tier (complex/coding tasks): claude-3-5-sonnet-v2@20241022
  - Superior tier (very complex/system design): o1-2024-12-01
- Default to granite3.1-dense:2b for local development
- Never use models not listed in models.md
- Model selection based on:
  - Task complexity (0-1 scale)
  - Task type (coding, system_design, analysis, general)
  - Context length
  - Performance requirements

### Type Organization
- Keep all core types in src/lib/types/core.ts
- Re-export types from a single location (src/types/index.ts)
- Use core types consistently across the codebase
- Avoid duplicate type definitions
- When using types in tests, always import from core types
- Ensure mock implementations fully satisfy interfaces
- Use type assertions sparingly and only in test utilities
- Keep type definitions close to their implementations

### Type Consistency Rules
- Always import Message type from lib/types/core
- Always import Agent interfaces from lib/types/core
- Use enums (MessageType, AgentType, AgentStatus) from core
- Avoid creating duplicate or parallel type definitions
- Update all related files when changing core types
- Keep all core types in src/lib/types/core.ts
- Re-export types from a single location (src/types/index.ts)
- Use core types consistently across the codebase
- Avoid duplicate type definitions

### Test Setup and Utilities

### Known Test Issues
- React test utils deprecation: Use `act` from 'react' instead of 'react-dom/test-utils'
- Supabase tests require valid JSON in responses
- Some test timeouts occur after 10s - may need timeout adjustment
- Type checking can be slow on large codebases - consider running in chunks
- Several test files have no tests implemented yet

### Testing Emotional Processing
- Match exact trigger words ('dangerous' -> 'caution', 'success' -> 'positive')
- Check emotional state changes before response generation
- Test both direct triggers and emotional state effects
- Use specific test messages to avoid random neutral responses
- Verify emotional memory storage after processing

### Common Test Failures
- AmygdalaAgent emotional responses not matching expected strings
- chatStore message handling and clearing issues
- useChat agent activation issues
- ActivityMonitor event emission timing issues

### Test Coverage Gaps
Critical areas needing test coverage:
- OrchestratorAgent
- ToolPipeline
- PerformanceOptimizer
- HostAgentRuntime
- BrainCore
- AgentRegistry
- MLService

### Test Infrastructure
- Default test timeout: 10s
- Use longer timeouts for integration tests and type checking (>10s)
- Type checking can be slow on large codebases
- Run type checking in chunks:
  - Check specific directories: `cd src/lib/agents && npx tsc --noEmit *.ts`
  - Check core types first: `cd src/lib/types && npx tsc --noEmit *.ts`
  - Check tests separately: `cd src/__tests__ && npx tsc --noEmit *.ts`
  - Always use npx when running tsc directly
  - Use simple patterns to avoid glob issues
  - Change directory first to use relative paths
- Type errors in test files do not prevent dev server from running
- Build commands may timeout in development environment
- Consider running specific test suites rather than full suite
- Use --max-old-space-size=4096 for large builds
- Split test runs into smaller chunks
- Run targeted linting on specific directories
- Consider using parallel test execution
- Consider using project references to split compilation
- Mock Supabase responses must be valid JSON
- Clean up test data in afterEach blocks
- Reset mocks between tests

- Project uses Vitest, not Jest
- Import test utilities from 'vitest' not 'jest'
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Test files must import { expect, describe, it, beforeEach } from 'vitest'
- Use test utilities from src/test/test-utils.ts for common mocks
- Mock agents should extend MockAgent from test-utils
- Mock messages should use createMockMessage from test-utils
- Mock network calls using mockFetch, mockResponse, mockErrorResponse

### Type Organization
- Keep all core types in src/lib/types/core.ts
- Re-export types from a single location (src/types/index.ts)
- Use core types consistently across the codebase
- Avoid duplicate type definitions
- When using types in tests, always import from core types
- Ensure mock implementations fully satisfy interfaces
- Use type assertions sparingly and only in test utilities
- Keep type definitions close to their implementations

### Store Testing
- Mock store modules using vi.mock()
- Return mock state and functions from store mocks
- Use act() when updating store state in tests
- Test store subscriptions cleanup
- Mock only the minimum required store functionality
- Keep store mocks close to actual store shape

### Monitoring and Metrics
- Track agent metrics in a central monitor
- Use mutex locks for thread safety
- Implement periodic cleanup of old data
- Track message counts, errors, response times
- Use consistent metric types across codebase
- Implement proper cleanup in dispose methods
- Project uses Vitest, not Jest
- Import test utilities from 'vitest' not 'jest'
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Test files must import { expect, describe, it, beforeEach } from 'vitest'
- Use test utilities from src/test/test-utils.ts for common mocks
- Mock agents should extend MockAgent from test-utils
- Mock messages should use createMockMessage from test-utils
- Mock network calls using mockFetch, mockResponse, mockErrorResponse

### Store Testing
- Mock store modules using vi.mock()
- Return mock state and functions from store mocks
- Use act() when updating store state in tests
- Test store subscriptions cleanup
- Mock only the minimum required store functionality
- Keep store mocks close to actual store shape

### Monitoring and Metrics
- Track agent metrics in a central monitor
- Use mutex locks for thread safety
- Implement periodic cleanup of old data
- Track message counts, errors, response times
- Use consistent metric types across codebase
- Implement proper cleanup in dispose methods
- Mock store modules using vi.mock()
- Return mock state and functions from store mocks
- Use act() when updating store state in tests
- Test store subscriptions cleanup
- Mock only the minimum required store functionality
- Keep store mocks close to actual store shape
- Project uses Vitest, not Jest
- Import test utilities from 'vitest' not 'jest'
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Test files must import { expect, describe, it, beforeEach } from 'vitest'
- Use test utilities from src/test/test-utils.ts for common mocks
- Mock agents should extend MockAgent from test-utils
- Mock messages should use createMockMessage from test-utils
- Mock network calls using mockFetch, mockResponse, mockErrorResponse
- Type errors in test files do not prevent dev server from running
- Build commands may timeout in development environment
- Consider running specific test suites rather than full suite
- Use --max-old-space-size=4096 for large builds
- Split test runs into smaller chunks
- Run targeted linting on specific directories
- Consider using parallel test execution

### Test Mocking Best Practices
- Use vi.fn() for simple function mocks
- Use vi.mock() for module mocks
- Use vi.spyOn() for method spies
- Mock at the lowest possible level
- Reset mocks in beforeEach
- Clear all mocks in afterEach
- Use strong typing for mocked functions
- Project uses Vitest, not Jest
- Import test utilities from 'vitest' not 'jest'
- Use vi.fn() instead of jest.fn()
- Use vi.mock() instead of jest.mock()
- Use vi.spyOn() instead of jest.spyOn()
- Test files must import { expect, describe, it, beforeEach } from 'vitest'
- Use test utilities from src/test/test-utils.ts for common mocks
- Mock agents should extend MockAgent from test-utils
- Mock messages should use createMockMessage from test-utils
- Mock network calls using mockFetch, mockResponse, mockErrorResponse
- Type errors in test files do not prevent dev server from running

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

### Import Paths
- Use @/ alias for imports from src directory (e.g. '@/lib/providers')
- Don't use .js extensions in TypeScript imports
- Vite resolves @ to src directory via vite.config.ts aliases

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

### Panel Component Structure
- Split complex panels into Content/Container pattern
- Use Tabs for organizing multiple features
- Include refresh functionality for data-driven panels
- Show loading overlay for long operations
- Provide clear error states with recovery options
- Group related controls with Card components
- Use consistent spacing (space-y-4)
- Include aria-labels for accessibility
- Implement proper error boundaries
- Use ToolhouseErrorBoundary for error handling
- Show LoadingSpinner during loading states
- Use Card components to group related content
- Include proper headings and subheadings
- Add descriptive text for empty states
- Use consistent button patterns (Plus icon for add, etc.)
- Implement responsive layouts with grid/flex

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

Important:
- Always import Message type from lib/types/core
- Always use MessageType enum from lib/types/core
- Include all required fields
- Optional fields: metadata, status, sender, recipient
- MessageType values must be uppercase (e.g., MessageType.USER, MessageType.SYSTEM)
- Available MessageTypes: USER, SYSTEM, TASK, RESPONSE, ERROR, BROADCAST, HANDOFF

### Agent System Architecture
- Agent Registry manages agent types and creation
  - Must register BASE agent type first
  - All agents extend BaseAgent
  - Registry is singleton pattern
  - Supports dynamic agent registration
- Agent State handles state transitions and timeouts
  - Transitions to OFFLINE on timeout
  - Cleans up timeouts on dispose
  - Validates state transitions
- Agent Runtime manages message processing and lifecycle
  - Uses MessageQueue for async processing
  - Handles graceful shutdown
  - Supports message filtering
- Host Runtime manages multiple agents and broadcasting
  - Coordinates agent lifecycle
  - Handles agent creation/cloning
  - Manages broadcast messaging

### Agent Testing
When working with agents:

### Agent Initialization
- AgentRegistry must be initialized before AgentContext
- Default agents must be registered in registerDefaultAgents()
- At least one agent must be registered for chat to work
- Agent types: ORCHESTRATOR, WORKER, SPECIALIST
- Each agent needs at least one capability
- Agent names default to "Agent {id}" if not provided
- Agent states must transition to OFFLINE on timeout
- Agent runtime must clean up resources on shutdown
- Host runtime must handle agent creation and cleanup

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

### Type System
- Use const assertions for enums: `as const`
- Explicitly export interfaces: `export { InterfaceName }`
- Use type assertions for empty arrays: `[] as Type[]`
- Use union types for string literals: `type Status = 'available' | 'busy' | 'offline'`
- Define constants as `const NAME = {...} as const` instead of `enum`
- Enum values should be uppercase (e.g., MessageType.USER instead of 'user')
- Import types from src/lib/types/core.ts to ensure consistency
- Mock implementations must fully satisfy interfaces
- Use type assertions only in test utilities

### Test Assertions
- Use toEqual() for object comparisons instead of individual property checks
- Handle async/await properly in test cases
- Mock external dependencies and services
- Use type assertions in mock implementations
- Test both success and error cases
- Verify all required fields in message objects

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

Important:
- Always import Message type from lib/types/core
- Always use MessageType enum from lib/types/core
- Include all required fields
- Optional fields: metadata, status, sender, recipient

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

### Build and Test Performance
- Build commands may timeout in development environment
- Consider running specific test suites rather than full suite
- Use --max-old-space-size=4096 for large builds
- Split test runs into smaller chunks
- Run targeted linting on specific directories
- Consider using parallel test execution

### Performance Optimization Patterns
- Use LRU cache eviction for memory management
- Implement batch processing with size limits
- Pre-fetch frequently accessed data
- Use parallel processing with concurrency limits
- Monitor and log performance metrics
- Clean up old cache entries periodically
- Deduplicate data before processing
- Trigger cleanup when memory usage is high
- Use batched metrics collection
- Log performance issues for monitoring

### Development Server
- Dev server runs on port 3000
- Proxy server runs on port 3001
- Check for port conflicts with `lsof -i :PORT`
- Kill conflicting processes with `kill PID`
- Always verify both Vite and proxy server start successfully
- Run tests in GitHub Actions
- Generate coverage reports
- Enforce minimum coverage
- Block merges on test failures
- Use GH_TOKEN instead of GITHUB_TOKEN for Vercel deployments to avoid conflicts
