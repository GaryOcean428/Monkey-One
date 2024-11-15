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

## Tech Stack

- React 18+ with TypeScript
- Vite for fast development and optimized builds
- TailwindCSS for styling
- Firebase for backend services
- Jest and React Testing Library for testing
- ESLint and Prettier for code quality
- Husky and lint-staged for git hooks

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/monkey-one.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
monkey-one/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Core library code
│   │   ├── agents/    # Agent implementations
│   │   ├── tools/     # Tool implementations
│   │   ├── memory/    # Memory management
│   │   └── runtime/   # Runtime environment
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── __tests__/     # Test files
├── docs/              # Documentation
└── public/            # Static assets
```

## Architecture

The system is built on several key components:

- **BaseAgent**: Core agent implementation with message handling capabilities
- **OrchestratorAgent**: Manages task delegation and agent coordination
- **MessageBroker**: Handles inter-agent communication
- **ToolPipeline**: Manages tool execution and security
- **AgentRuntime**: Provides execution environment for agents

For detailed architecture documentation, see [PROJECT.md](docs/PROJECT.md).

## Testing

The project maintains high test coverage with comprehensive unit and integration tests:

- Unit tests for individual components and utilities
- Integration tests for agent communication
- End-to-end tests for critical workflows
- Performance benchmarks

Run tests with:
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

### Development Guidelines

- Follow the TypeScript + ESLint + Prettier configuration
- Maintain test coverage above 80%
- Update documentation as needed
- Follow conventional commits specification

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
