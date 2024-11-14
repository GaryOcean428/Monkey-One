# Monkey One

An advanced AI agent system featuring hierarchical organization, multi-agent communication, and tool-based capability management.

## Features

- **Hierarchical Agent System**
  - Orchestrator agent for task delegation and coordination
  - Specialized agents (WebSurfer, FileSurfer, Coder) for specific tasks
  - Extensible agent architecture

- **Robust Communication Layer**
  - Message routing and handling
  - Context management
  - Event system
  - State synchronization

- **Tool Infrastructure**
  - Modular tool pipeline
  - Security middleware
  - Execution monitoring
  - Dynamic tool discovery

- **Memory Management**
  - Conversation context tracking
  - Task state persistence
  - Progress monitoring

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/monkey-one.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## System Requirements

- Node.js 16+
- TypeScript 4.5+
- React 18+
- Jest for testing

## Quick Start

1. Configure your environment variables in `.env`
2. Start the development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Architecture

The system is built on several key components:

- **BaseAgent**: Core agent implementation with message handling capabilities
- **OrchestratorAgent**: Manages task delegation and agent coordination
- **MessageBroker**: Handles inter-agent communication
- **ToolPipeline**: Manages tool execution and security
- **AgentRuntime**: Provides execution environment for agents

For detailed architecture documentation, see [PROJECT.md](docs/PROJECT.md).

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Test Coverage

### Current Status
- **MessageHandlers Decorator**: 100% coverage
- **BaseAgent**: Comprehensive test suite covering initialization, message handling, and lifecycle management
- **OrchestratorAgent**: Initial test coverage for core functionality
- **Communication Layer**: 
  - MessageBroker: Basic test coverage
  - MessageQueue: Comprehensive test suite

### Test Coverage Gaps
1. **Runtime Components**
   - Incomplete coverage for WorkerAgentRuntime
   - Partial coverage for HostAgentRuntime

2. **Agent Implementations**
   - Limited test coverage for:
     - WebSurfer Agent
     - FileSurfer Agent
     - Coder Agent

3. **Tools and Utilities**
   - Minimal test coverage for:
     - ToolPipeline
     - SecurityMiddleware
     - AgentRegistry
     - AgentMonitor

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

When contributing, please ensure:
- 100% unit test coverage for new code
- All existing tests pass
- New tests cover edge cases and potential failure modes
- Documentation is updated as needed

## Error Handling

The system implements comprehensive error handling:
- Custom error types in `AgentErrors.ts`
- Error logging and monitoring
- Graceful degradation
- User-friendly error messages

## Security

- Request validation through SecurityMiddleware
- Tool execution sandboxing
- Input sanitization
- Rate limiting
- Authentication and authorization checks

## License

This project is licensed under the MIT License - see the LICENSE file for details.
