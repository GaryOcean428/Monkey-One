# Monkey One

A TypeScript-based AI agent system inspired by Microsoft's Magentic-One and AutoGen frameworks. This system implements a multi-agent architecture for solving complex tasks through specialized agents working together.

## Architecture

The system is built around several specialized agents that work together to accomplish tasks:

- **Orchestrator**: The lead agent responsible for task planning, delegation, and progress tracking. It maintains a task ledger and progress ledger to coordinate work between agents.

- **WebSurfer**: Handles web-based interactions including navigation, clicking, typing, and content extraction from web pages.

- **FileSurfer**: Manages file system operations including reading, writing, listing directories, and searching file contents.

- **Coder**: Specializes in writing, analyzing, and executing code across multiple programming languages.

Each agent has specific capabilities and can be composed into teams to solve complex tasks. The system uses a memory manager to maintain context and a tool system for executing actions.

## Features

- **Task Planning & Tracking**: The Orchestrator agent breaks down complex tasks into steps and tracks progress
- **Web Interaction**: WebSurfer agent can navigate and interact with web pages
- **File Operations**: FileSurfer agent handles file system tasks
- **Code Generation**: Coder agent can write and execute code in multiple languages
- **Memory Management**: Persistent memory system for maintaining context
- **Tool Integration**: Extensible tool system for executing actions
- **Progress Monitoring**: Built-in progress tracking and plan revision capabilities

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start the development server:

```bash
npm run dev
```

## Usage

The system can be used through the AgentManager class:

```typescript
import { agentManager } from './lib/agent';

// Process a message
const response = await agentManager.processMessage({
  id: '123',
  role: 'user',
  content: 'Create a simple web page',
  timestamp: Date.now()
});

// Create a custom agent
const agent = agentManager.createAgent('CustomAgent', 'coder');
```

## Architecture Details

### Task Ledger

The task ledger maintains:

- Facts: Known information about the task
- Assumptions: Educated guesses about requirements
- Current Plan: Steps to accomplish the task

### Progress Ledger

The progress ledger tracks:

- Completed Steps
- Current Step
- Remaining Steps
- Overall Status

### Memory System

The memory system stores:

- User Instructions
- Agent Responses
- Task Plans
- Execution Results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

# Monkey One

- Lightweight and fast
- Easy to configure
- Built-in testing support
- TypeScript support

## System Architecture

Monkey One is designed with a modular, scalable architecture consisting of:

- **Agent System**: Manages task delegation and communication.
- **Memory System**: Handles context management and long-term storage.
- **Model Router**: Dynamically selects models and balances load.
- **Tools Registry**: Provides utilities like web search and data processing.
- **Document System**: Manages document processing and vector-based search.

The framework integrates with various AI models and services:

- **Groq Models**: Supports a range of models for different complexity levels.
- **Perplexity Models**: Integrates advanced reasoning models.

When contributing, please follow these best practices:

- **Code Style**: Use TypeScript, maintain consistent formatting, and adhere to linting rules.
- **Component Structure**: Create small, focused components with clear interfaces.
- **Error Handling**: Implement comprehensive error handling with user-friendly messages.

## Environment Configuration

Create a `.env` file in the root directory and add the following environment variables:

1. set SERVICE_ENDPOINT=your_service_endpoint_here
