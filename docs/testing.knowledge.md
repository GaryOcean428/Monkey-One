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
- Use Vitest mocks instead of Jest
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

### CI/CD Integration
- Run tests in GitHub Actions
- Generate coverage reports
- Enforce minimum coverage
- Block merges on test failures

## Best Practices

1. Test Setup
- Use beforeEach for common setup
- Clean up after tests
- Avoid test interdependence
- Mock time-sensitive operations

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

2. Test Organization
- Group related tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and simple

3. Error Handling
- Test error conditions
- Verify error messages
- Check error recovery
- Test timeout handling

4. Performance
- Keep tests fast
- Avoid unnecessary mocks
- Use appropriate timeouts
- Optimize test data

## Common Patterns

### Agent Testing
```typescript
describe('AgentName', () => {
  let agent: AgentName;
  
  beforeEach(() => {
    vi.clearAllMocks();
    agent = new AgentName();
  });

  it('should initialize correctly', () => {
    expect(agent.capabilities).toBeDefined();
  });
});
```

### Mock Examples
```typescript
// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApp: vi.fn()
}));

// Mock API calls
vi.mock('@/lib/api', () => ({
  makeRequest: vi.fn()
}));

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await agent.processMessage(message);
  expect(result).toBeDefined();
});

it('should handle errors', async () => {
  await expect(agent.processMessage(invalidMessage))
    .rejects.toThrow('Invalid message');
});
```

### State Testing
```typescript
describe('state management', () => {
  beforeEach(() => {
    state.registerState({
      name: 'IDLE',
      transitions: ['BUSY'],
      timeout: 1000
    });
  });

  it('should transition states', async () => {
    await state.transition('BUSY');
    expect(state.getCurrentState().name).toBe('BUSY');
  });
});
```

### Runtime Testing
```typescript
describe('runtime lifecycle', () => {
  it('should process messages', async () => {
    const processSpy = vi.spyOn(agent, 'processMessage');
    await runtime.enqueueMessage(message);
    await runtime.processQueue();
    expect(processSpy).toHaveBeenCalled();
  });
});
```
