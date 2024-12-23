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
- Use GH_TOKEN instead of GITHUB_TOKEN for Vercel deployments to avoid conflicts

## Best Practices

1. Test Setup
- Use beforeEach for common setup
- Clean up after tests
- Avoid test interdependence
- Mock time-sensitive operations

### Testing Patterns
- Mock agents must implement all interface methods
- Use enums instead of string literals for types and statuses
- Monitor classes should expose methods for registration and status updates
- Test files should import non-type dependencies without 'type' keyword
- Monitoring classes should provide both synchronous and asynchronous metrics methods
- Message interface includes optional sender/recipient for routing tests
- Mock implementations should match the real interface shape exactly, including all optional fields
- When importing enums used as values (not just types), avoid using 'type' import
- When implementing mock objects, ensure all required fields from interfaces are present
- When testing optimizers or monitors, implement both sync and async versions of metrics methods
- When testing runtime classes, consider making some private members protected or public for testing
- When using MessageType enum, always import it as a value import, not a type import
- Make methods protected instead of private when they need to be accessed in tests
- Return synchronous values instead of promises when possible to simplify testing
- Base classes should provide default implementations of interface methods when possible
- Abstract methods should be clearly marked in base classes
- When testing protected methods, create a test subclass that exposes them as public methods
- Always define interfaces for complex data structures like MotorPattern before using them in tests
- When using enums in tests, define them in types/index.ts and export them properly
- Memory items and other domain objects should always have an id field
- Import all required types and enums at the top of test files
- Use type annotations for test data to catch type errors early
- Prefer number timestamps over Date objects for consistency and easier testing
- Avoid duplicate logger instances by importing the shared logger instance
- Import error types from their source files rather than recreating them
- Export interfaces and enums explicitly when they are used as values in tests
- Use enums for status fields instead of string literals to catch type errors early
- Keep mock constructors simple - avoid passing parameters that can be set as defaults
- Mock agents must implement all interface methods
- Use enums instead of string literals for types and statuses
- Monitor classes should expose methods for registration and status updates
- Test files should import non-type dependencies without 'type' keyword
- Monitoring classes should provide both synchronous and asynchronous metrics methods
- Message interface includes optional sender/recipient for routing tests
- Mock implementations should match the real interface shape exactly, including all optional fields
- When importing enums used as values (not just types), avoid using 'type' import
- When implementing mock objects, ensure all required fields from interfaces are present
- When testing optimizers or monitors, implement both sync and async versions of metrics methods
- When testing runtime classes, consider making some private members protected or public for testing
- When using MessageType enum, always import it as a value import, not a type import
- Make methods protected instead of private when they need to be accessed in tests
- Return synchronous values instead of promises when possible to simplify testing
- Base classes should provide default implementations of interface methods when possible
- Abstract methods should be clearly marked in base classes
- When testing protected methods, create a test subclass that exposes them as public methods
- Always define interfaces for complex data structures like MotorPattern before using them in tests
- When using enums in tests, define them in types/index.ts and export them properly
- Memory items and other domain objects should always have an id field
- Import all required types and enums at the top of test files
- Use type annotations for test data to catch type errors early
- Prefer number timestamps over Date objects for consistency and easier testing
- Avoid duplicate logger instances by importing the shared logger instance
- Import error types from their source files rather than recreating them
- Export interfaces and enums explicitly when they are used as values in tests
- Use enums for status fields instead of string literals to catch type errors early
- Mock agents must implement all interface methods
- Use enums instead of string literals for types and statuses
- Monitor classes should expose methods for registration and status updates
- Test files should import non-type dependencies without 'type' keyword
- Monitoring classes should provide both synchronous and asynchronous metrics methods
- Message interface includes optional sender/recipient for routing tests
- Mock implementations should match the real interface shape exactly, including all optional fields
- When importing enums used as values (not just types), avoid using 'type' import
- When implementing mock objects, ensure all required fields from interfaces are present
- When testing optimizers or monitors, implement both sync and async versions of metrics methods
- When testing runtime classes, consider making some private members protected or public for testing
- When using MessageType enum, always import it as a value import, not a type import
- Make methods protected instead of private when they need to be accessed in tests
- Return synchronous values instead of promises when possible to simplify testing
- Base classes should provide default implementations of interface methods when possible
- Abstract methods should be clearly marked in base classes
- When testing protected methods, create a test subclass that exposes them as public methods
- Always define interfaces for complex data structures like MotorPattern before using them in tests
- When using enums in tests, define them in types/index.ts and export them properly
- Memory items and other domain objects should always have an id field
- Import all required types and enums at the top of test files
- Use type annotations for test data to catch type errors early
- Prefer number timestamps over Date objects for consistency and easier testing
- Avoid duplicate logger instances by importing the shared logger instance
- Import error types from their source files rather than recreating them
- Export interfaces and enums explicitly when they are used as values in tests
- Mock agents must implement all interface methods
- Use enums instead of string literals for types and statuses
- Monitor classes should expose methods for registration and status updates
- Test files should import non-type dependencies without 'type' keyword
- Monitoring classes should provide both synchronous and asynchronous metrics methods
- Message interface includes optional sender/recipient for routing tests
- Mock implementations should match the real interface shape exactly, including all optional fields
- When importing enums used as values (not just types), avoid using 'type' import
- When implementing mock objects, ensure all required fields from interfaces are present
- When testing optimizers or monitors, implement both sync and async versions of metrics methods
- When testing runtime classes, consider making some private members protected or public for testing
- When using MessageType enum, always import it as a value import, not a type import
- Make methods protected instead of private when they need to be accessed in tests
- Return synchronous values instead of promises when possible to simplify testing
- Base classes should provide default implementations of interface methods when possible
- Abstract methods should be clearly marked in base classes
- When testing protected methods, create a test subclass that exposes them as public methods
- Always define interfaces for complex data structures like MotorPattern before using them in tests
- When using enums in tests, define them in types/index.ts and export them properly
- Memory items and other domain objects should always have an id field
- Import all required types and enums at the top of test files
- Use type annotations for test data to catch type errors early
- Prefer number timestamps over Date objects for consistency and easier testing
- Avoid duplicate logger instances by importing the shared logger instance
- Import error types from their source files rather than recreating them
- Mock agents must implement all interface methods
- Use enums instead of string literals for types and statuses
- Monitor classes should expose methods for registration and status updates
- Test files should import non-type dependencies without 'type' keyword
- Monitoring classes should provide both synchronous and asynchronous metrics methods
- Message interface includes optional sender/recipient for routing tests
- Mock implementations should match the real interface shape exactly, including all optional fields
- When importing enums used as values (not just types), avoid using 'type' import
- When implementing mock objects, ensure all required fields from interfaces are present
- When testing optimizers or monitors, implement both sync and async versions of metrics methods
- When testing runtime classes, consider making some private members protected or public for testing
- When using MessageType enum, always import it as a value import, not a type import
- Make methods protected instead of private when they need to be accessed in tests
- Return synchronous values instead of promises when possible to simplify testing
- Base classes should provide default implementations of interface methods when possible
- Abstract methods should be clearly marked in base classes
- When testing protected methods, create a test subclass that exposes them as public methods
- Always define interfaces for complex data structures like MotorPattern before using them in tests
- When using enums in tests, define them in types/index.ts and export them properly
- Memory items and other domain objects should always have an id field
- Import all required types and enums at the top of test files
- Use type annotations for test data to catch type errors early
- Prefer number timestamps over Date objects for consistency and easier testing
- Avoid duplicate logger instances by importing the shared logger instance

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
