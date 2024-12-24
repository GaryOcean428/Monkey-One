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

- Use `AgentType` enum for agent types (e.g., `AgentType.ORCHESTRATOR`)
- Use `AgentStatus` enum for agent status (e.g., `AgentStatus.IDLE`)
- Use `MessageType` enum for message types (e.g., `MessageType.TASK`)

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
