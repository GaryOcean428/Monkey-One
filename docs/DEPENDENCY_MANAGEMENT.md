# Dependency Management Guidelines

This document provides best practices for managing dependencies in the Monkey-One project.

## Recent Updates (March 2025)

### TypeScript Error Resolution
- Fixed critical syntax errors in multiple files (WorkflowAgent.ts, MLService.ts, AgentCommunicationService.ts)
- Resolved file case sensitivity issues with sidebar components
- Created documentation for addressing remaining TypeScript errors (see docs/TYPESCRIPT_ERROR_RESOLUTION.md)
- Type errors are mostly in test files and not affecting runtime behavior

### Deprecated Types Removal
- Removed `@types/dotenv`, `@types/ioredis`, `@types/puppeteer`, and `@types/axios`
- These packages are now deprecated as the main packages provide their own type definitions

### Supabase Auth Migration
- Migrated from `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
- Updated client creation methods to use the new SSR package

### Husky Update
- Updated Husky configuration to use the modern syntax
- Changed from `husky install` to `husky` in the prepare script

### Updated Major Dependencies
- Upgraded `undici` from 5.x to 7.5.0 for improved performance and security
- Prepared `react-router-dom` for future v7 migration by adding future flags

## Dependency Update Process

### Regular Updates (Minor/Patch)

For routine dependency updates:

```bash
# Check for available updates
pnpm run check-updates

# Apply non-breaking updates
pnpm run update-deps
```

### Major Version Updates

For major version updates that might include breaking changes:

1. **Research the changes first:**
   ```bash
   # Check specific package changes
   npx npm-check-updates --target latest --filter <package-name>
   ```

2. **Update one major package at a time:**
   ```bash
   pnpm add <package-name>@latest
   ```

3. **Update resolutions if needed:**
   Update the `resolutions` field in package.json to ensure consistent versions.

4. **Test thoroughly:**
   ```bash
   pnpm run test
   pnpm run type-check
   pnpm run build
   ```

## Dealing with Deprecation Warnings

### Type Definitions (@types/*)
When encountering "This is a stub types definition" warnings:
1. Remove the @types package
2. Ensure you're using the latest version of the main package
3. Update imports if the typing structure changed

### Framework Dependencies
For packages like React Router:
1. Update to the latest minor version of the current major version
2. Enable future flags to identify potential breaking changes
3. Fix any warnings or issues
4. Update to the new major version

### Authentication Libraries
For auth-related packages:
1. Check if there's a recommended migration path (like Supabase auth-helpers to SSR)
2. Update client creation code
3. Test authentication flows thoroughly

## Package Resolution Strategy

This project uses PNPM package manager with specific resolution rules:

```json
"resolutions": {
  "undici": "^7.5.0",
  "path-to-regexp": "^8.0.0",
  "semver": "^7.5.4",
  "tar": "^7.4.3",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

These ensure consistent versions of critical dependencies across all packages.

## Special Considerations

### TypeScript Error Management

When updating dependencies, TypeScript errors may appear due to:

1. **Type Definition Changes**: 
   - New major versions often include updated type definitions that are more strict
   - Fix by updating your code to match the new type requirements rather than using type assertions

2. **Import Path Changes**:
   - Packages may change their export structure (e.g., React Router v6 → v7)
   - Update import paths systematically using search and replace tools

3. **Case Sensitivity Issues**:
   - TypeScript is case-sensitive for file paths, even on case-insensitive file systems
   - Ensure consistent casing in file names and imports
   - When conflicts occur, consider renaming files to clearly indicate their purpose

For resolving TypeScript errors after dependency updates:
1. Fix syntax errors in main application code first
2. Address type system structural issues next
3. Fix test files last, as they don't affect runtime behavior
4. Avoid using `// @ts-ignore` or `any` types as permanent solutions

### React and React DOM
Keep React and React DOM versions in sync to avoid compatibility issues. Currently, we use React 18.2.0 which includes:

- Improved concurrent rendering
- Automatic batching of state updates
- Transitions for urgent vs non-urgent updates
- Server components support
- Suspense for data fetching

### TypeScript and Related Tools
When updating TypeScript, also update related tools:
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser

### Husky and Git Hooks
Since migrating to Husky v9+, we use the simplified setup. The `prepare` script uses:
```json
"prepare": "husky"
```

This automatically sets up Git hooks when installing dependencies.

## Maintenance Schedule

- **Weekly**: Run `pnpm run check-updates` to stay aware of available updates
- **Monthly**: Apply non-breaking updates with `pnpm run update-deps`
- **Quarterly**: Evaluate and plan for major version updates