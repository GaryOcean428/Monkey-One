# Monkey-One Project Improvement Plan

## Executive Summary

This document outlines a comprehensive plan to improve the Monkey-One project by addressing dependency issues, modernizing libraries, optimizing build processes, and enhancing the codebase quality. The plan is organized into phased improvements with clear goals and success criteria.

## Current State Assessment

### Dependency Issues

1. **Missing Dependencies**: The following essential packages are imported but not declared in package.json:
   - puppeteer (WebAutomationTool.ts)
   - node-schedule (TaskManager.ts)
   - sequelize (ml/models/index.ts)
   - express (middleware/cors.ts)
   - ioredis (cache/redis.ts)
   - @monaco-editor/react (CodeEditor.tsx)
   - three (BrainVisualizer.tsx)
   - eslint-plugin-react and eslint-plugin-vitest (.eslintrc.json)

2. **Unused Dependencies**: Multiple unused packages are installed, contributing to bloat:
   - @ai-sdk/openai, @heroicons/react, @radix-ui/* (several components)
   - @tensorflow/tfjs-node, @toolhouseai/sdk
   - cookie, debug, isomorphic-fetch, path-to-regexp, semver, tar, undici
   - Various dev dependencies (@tailwindcss/forms, @testing-library/user-event, etc.)

3. **Deprecated Dependencies**: Some packages show deprecation warnings:
   - @types/dotenv, @types/ioredis, @types/puppeteer, @types/axios
   - @supabase/auth-helpers-nextjs (deprecated in favor of @supabase/ssr)

4. **Outdated Dependencies**: Several packages have major version updates available:
   - react-router-dom (6.30.0 → 7.4.0)
   - framer-motion (11.18.2 → 12.5.0)
   - @sentry/browser (8.55.0 → 9.9.0)
   - Various dev tools

### Build and Configuration Issues

1. **Bundle Size**: Large JavaScript chunks that could be optimized
2. **React Router**: Not prepared for version 7 migration
3. **Husky**: Using deprecated installation method
4. **Dependency Management**: No clear strategy for updating dependencies

## Improvement Plan

### Phase 1: Foundation Fixes (Immediate)

#### 1.1. Resolve Missing Dependencies

```bash
# Install required packages
pnpm add puppeteer node-schedule sequelize express ioredis @monaco-editor/react three
pnpm add -D eslint-plugin-react eslint-plugin-vitest
```

#### 1.2. Remove Deprecated Type Packages

```bash
# Remove unnecessary type packages
pnpm uninstall @types/dotenv @types/ioredis @types/puppeteer @types/axios
```

#### 1.3. Update Authentication Dependencies

```bash
# Migrate from deprecated auth helpers
pnpm uninstall @supabase/auth-helpers-nextjs
pnpm add @supabase/ssr
```

#### 1.4. Fix Husky Configuration

```bash
# Modernize Husky setup
pnpm add -D husky@latest
```

Update package.json:
```json
"prepare": "husky"
```

#### 1.5. Add Dependency Management Tools

```bash
# Add dependency tools
pnpm add -D npm-check-updates depcheck
```

Add to package.json:
```json
"scripts": {
  "check-updates": "npx npm-check-updates",
  "update-deps": "npx npm-check-updates -u && pnpm install",
  "audit-deps": "npx depcheck"
}
```

### Phase 2: Major Framework Updates (Near-term)

#### 2.1. Prepare React Router for v7

Update the router configuration in `src/routes.tsx`:

```typescript
const router = createBrowserRouter(
  routes,
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true
    }
  }
);
```

#### 2.2. Update to React Router v7

```bash
# Update to React Router v7
pnpm add react-router@latest
```

Update imports throughout the codebase:
```bash
# Find files using react-router-dom imports
find ./src -type f -name "*.ts*" -exec grep -l "from 'react-router-dom'" {} \;

# Replace imports
find ./src -type f -name "*.ts*" -exec sed -i 's|from "react-router-dom"|from "react-router"|g' {} \;
find ./src -type f -name "*.ts*" -exec sed -i "s|from 'react-router-dom'|from 'react-router'|g" {} \;
```

Adjust DOM-specific imports where needed:
```typescript
import { RouterProvider } from 'react-router/dom';
```

#### 2.3. Update undici to Latest Version

```bash
# Update undici
pnpm add undici@latest
```

Update package.json resolutions:
```json
"resolutions": {
  "undici": "^7.5.0"
}
```

### Phase 3: Dependency Cleanup (Mid-term)

#### 3.1. Remove Unused Dependencies

Analyze and remove unused dependencies in stages to prevent breaking changes:

```bash
# Run dependency check
npx depcheck > depcheck-report.txt

# Remove dependencies one at a time after testing
pnpm uninstall <package-name>
```

Priority unused dependencies to evaluate:
- @ai-sdk/openai
- @heroicons/react
- @radix-ui/* (check each one)
- @tensorflow/tfjs-node (if not needed)
- cookie, debug, isomorphic-fetch

#### 3.2. Update Remaining Dependencies

```bash
# Update all non-major dependencies
pnpm update

# Check for major updates
pnpm run check-updates
```

Update packages incrementally, testing after each update:
- @hookform/resolvers (3.10.0 → 4.1.3)
- @huggingface/inference (2.8.1 → 3.6.1)
- @sentry/browser (8.55.0 → 9.9.0)

### Phase 4: Build Optimization (Long-term)

#### 4.1. Optimize Bundle Size

Update `vite.config.ts` with improved code splitting:

```typescript
build: {
  // Increase warning limit temporarily during optimization
  chunkSizeWarningLimit: 1200,
  
  rollupOptions: {
    output: {
      manualChunks: {
        // Optimize chunking strategy
      }
    }
  }
}
```

#### 4.2. Implement Dynamic Imports

Convert large, non-critical components to use dynamic imports:

```typescript
// Before
import { HeavyComponent } from './HeavyComponent';

// After
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

#### 4.3. Implement Tree-Shaking Optimization

Review large libraries and switch to granular imports:

```typescript
// Before
import * as TensorFlow from '@tensorflow/tfjs';

// After
import { specificFunction } from '@tensorflow/tfjs/specificModule';
```

## Implementation Timeline

| Phase | Task | Timeline | Success Criteria |
|-------|------|----------|------------------|
| 1.1-1.5 | Foundation Fixes | Week 1 | No console errors, clean test run |
| 2.1-2.3 | Framework Updates | Week 2-3 | All components render correctly, tests pass |
| 3.1-3.2 | Dependency Cleanup | Week 4-5 | Reduced dependency count, no unused warnings |
| 4.1-4.3 | Build Optimization | Week 6-8 | 20%+ bundle size reduction |

## Monitoring and Validation

- Run `pnpm run validate` after each major change
- Track bundle size with `rollup-plugin-visualizer`
- Monitor performance metrics before/after optimization
- Run integration tests to ensure functionality

## Documentation Updates

- Update `DEPENDENCY_MANAGEMENT.md` with new guidelines
- Create `OPTIMIZATION.md` with documentation on build configuration
- Update README.md with new development workflow

## Conclusion

This improvement plan addresses the key issues in the Monkey-One project's dependency management and build configuration. By implementing these changes in a phased approach, we can modernize the codebase, improve security, and enhance performance while minimizing the risk of introducing breaking changes.

Regular dependency audits using the new tools will help maintain a healthy codebase going forward.