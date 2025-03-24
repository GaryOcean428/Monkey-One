# Monkey-One Development Guide

## Commands

- Build: `npm run build`
- Dev: `npm run dev` (Vite + proxy server)
- Test: `npm run test` (all tests)
- Test single file: `npm run test src/__tests__/path/to/file.test.ts`
- Test watch: `npm run test:watch`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Format: `npm run format`
- Type check: `npm run type-check`
- Validate all: `npm run validate`

## Code Style

- **TypeScript**: Strong typing with specific interfaces for all data structures
- **Imports**: Group by type (React, external, internal), sorted alphabetically
- **Formatting**: Prettier with 2-space indentation
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use custom error classes in `lib/errors` directory
- **Components**: Functional React components with explicit Props interface
- **State**: Use zustand for global state, React hooks for local state
- **Testing**: Vitest with React Testing Library, cover edge cases
- **AI Configuration**: Follow rules in `cursor/rules.ts` for AI model parameters
- **Security**: Never commit API keys, use .env files for secrets

## AI Rules

- Temperature: 0.0-1.0 (default 0.7)
- Max tokens: 1-32768 (default 4096)
- Timeouts: 30s default with 3 retry attempts
