# Husky Git Hooks Configuration

This document explains how the git hooks are set up in the Monkey-One project and how to use them effectively.

## Overview

Git hooks are used to automatically run scripts before certain git operations like commit, push, etc. This project uses [Husky](https://typicode.github.io/husky/) to manage git hooks.

## Current Hooks

### pre-commit

The pre-commit hook runs before a commit is created. It currently:

- Runs `lint-staged` to format and lint only the files that are staged for commit (not the entire codebase)
- Runs type checking to catch type errors

These checks ensure code quality without running the full test suite, which can be time-consuming.

## Bypassing Hooks

In situations where you need to bypass the hooks (e.g. for quick fixes or WIP commits):

```bash
# Option 1: Bypass for a single commit
HUSKY=0 git commit -m "Your commit message"

# Option 2: Temporarily disable hooks
git config --local core.hooksPath /dev/null
# ... make your commits ...
git config --local --unset core.hooksPath 
```

## Running Tests Manually

Tests can be run manually using one of these commands:

- `pnpm run test` - Run all tests
- `pnpm run test:fast` - Run tests with passWithNoTests flag (faster)
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Run tests with coverage report

## Known Issues with Tests

The test suite currently has multiple failing tests due to:

1. Model configuration tests failing due to outdated model names
2. Component tests failing due to missing providers
3. Agent-related tests failing due to expected undefined properties

The team is working on addressing these issues. When making changes, focus on ensuring your new code passes tests related to the components you're working on.

## CI/CD Pipeline 

The CI/CD pipeline runs the full test suite, so it's important to run tests manually before pushing to main branches:

```bash
pnpm run test
```

## Customizing Hooks

If you need to modify the hooks:

1. Edit the hook scripts in the `.husky` directory
2. Update configuration in `package.json` (lint-staged config, etc.)
3. Document your changes in this file

## Troubleshooting

If you encounter issues with the hooks:

1. Check the error messages carefully
2. Make sure Husky is properly installed (`pnpm run prepare`)
3. For errors in specific hooks, check the corresponding script
4. Re-initialize hooks with `npx husky init` if needed