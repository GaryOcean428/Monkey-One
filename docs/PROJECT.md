# Monkey One System Documentation

[Previous content remains unchanged until Testing section]

### Testing

#### Test Infrastructure

- **Framework**: Jest with TypeScript support
- **Environment**: jsdom for browser simulation
- **Test Runner**: ts-jest
- **Testing Utilities**: React Testing Library

#### Test Organization

- `src/__tests__/`: Main test directory
- `src/setupTests.ts`: Global test setup and mocks
- `coverage/`: Test coverage reports (generated with `npm run test:coverage`)

#### Test Types

1. **Unit Tests**
   - Component testing
   - Decorator testing
   - Utility function testing
   - Error handling verification

2. **Integration Tests**
   - Message handling flows
   - Agent communication
   - State management
   - API integration

3. **Error Scenario Testing**
   - Invalid message types
   - Network failures
   - Authentication errors
   - Rate limit handling

4. **Performance Benchmarks**
   - Response time measurements
   - Memory usage tracking
   - API call efficiency
   - State update performance

#### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

[Rest of the content remains unchanged]
