# TypeScript Error Resolution Plan

## Overview

This document outlines a structured approach to address the remaining TypeScript errors in the Monkey-One project following our recent dependency updates and syntax fixes. The errors are categorized by type and priority to allow for systematic resolution.

## Error Categories

### 1. Test File Issues

Many errors are concentrated in test files, where mocks and assertions interact with protected class properties or use type-only imports incorrectly.

**Common patterns:**
- Accessing protected/private properties (`TS2445` errors)
- Using type-only imports as values (`TS2693` errors) 
- Incorrect enum usage for types declared with `export type` (`TS1362` errors)
- Missing properties on mocked objects (`TS2339` errors)

**Affected Files:**
- `src/__tests__/MessageHandlers.test.ts`
- `src/__tests__/agents/*.test.ts` (multiple files)
- `src/test/test-utils.ts`

### 2. Type Definition Issues

Problems with type definitions in core code files, including:

**Common patterns:**
- Re-exporting types incorrectly with `isolatedModules` enabled (`TS1205`, `TS1448` errors)
- Missing module declarations (`TS2307` errors)
- Incorrect typing for library functions (`TS2740`, `TS2739` errors)

**Affected Files:**
- `src/types/index.ts`
- `src/utils/metrics.ts`
- `src/tools/specialized/CodeAnalysisTool.ts`

### 3. Unused Variables/Imports

Variables and imports that are declared but not used, generating `TS6133` warnings.

**Affected Files:**
- `src/App.tsx` (unused `_queryClient`)
- Multiple test files with unused imports

## Resolution Approach

### Phase 1: Address Critical Application Code Issues

1. **Fix Type Re-exports in `src/types/index.ts`**:
   - Update type re-exports to use `export type` syntax
   - Resolve missing module imports
   - Ensure proper naming of imported types

2. **Fix Module Declaration Issues**:
   - Create missing module declarations or add proper types
   - Address the LLMProvider import in CodeAnalysisTool.ts

3. **Correct Metrics Type Issues**:
   - Update Prometheus metric type definitions in `src/utils/metrics.ts`
   - Implement proper interfaces for monitoring objects

### Phase 2: Fix Test Infrastructure

1. **Create Test Utility Classes**:
   - Develop proper test utilities for accessing protected properties
   - Create test-specific mock implementations that satisfy TypeScript

2. **Update Test Assertions**:
   - Revise test assertions to work with protected properties
   - Use proper type casting where appropriate

3. **Fix Enum Usage in Tests**:
   - Create value-based enum equivalents for tests
   - Update enum references to use the correct syntax

### Phase 3: Clean Up Unused Code

1. **Remove Unused Variables**:
   - Address `_queryClient` in App.tsx
   - Remove or utilize unused imports in test files

2. **Optimize Imports**:
   - Audit and clean up import statements
   - Ensure imports are organized consistently

## Guidelines for Fixes

When fixing TypeScript errors, follow these guidelines:

1. **Minimize Breaking Changes**:
   - Prefer non-breaking changes that preserve existing behavior
   - When modifying class structures, ensure all references are updated

2. **Maintain Test Coverage**:
   - Ensure tests continue to validate the intended behavior
   - Add test coverage for fixed issues where appropriate

3. **Document Complex Changes**:
   - Add comments explaining complex type solutions
   - Update relevant documentation when changing interfaces

4. **Avoid Quick Fixes**:
   - Do not use `// @ts-ignore` or `any` types except as a last resort
   - Prefer proper type solutions over bypassing TypeScript checks

## Implementation Priority

1. Critical application code errors that affect runtime behavior
2. Type system structural issues (re-exports, module declarations)
3. Test file errors
4. Unused variable warnings

## Success Criteria

- Clean TypeScript compilation with `pnpm run type-check`
- No regression in existing functionality
- No increase in technical debt through improper fixes
- All tests pass after fixes are implemented

## Post-Fix Actions

1. Create a full regression test suite run
2. Document any patterns found for future prevention
3. Update the CI pipeline to catch similar issues earlier