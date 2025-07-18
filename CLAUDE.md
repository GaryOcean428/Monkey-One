# Monkey-One Development Guide

## Commands

- Build: `pnpm run build`
- Dev: `pnpm run dev` (Vite + proxy server)
- Test: `pnpm run test` (all tests)
- Test single file: `pnpm run test src/__tests__/path/to/file.test.ts`
- Test watch: `pnpm run test:watch`
- Lint: `pnpm run lint`
- Lint fix: `pnpm run lint:fix`
- Format: `pnpm run format`
- Type check: `pnpm run type-check`
- Validate all: `pnpm run validate`

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
