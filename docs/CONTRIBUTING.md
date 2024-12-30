# Contributing to Monkey-One

Thank you for your interest in contributing to Monkey-One! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best interests of the project
- Report unacceptable behavior to project maintainers

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Monkey-One.git
   cd Monkey-One
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

1. **Check Existing Issues**
   - Look for existing issues or create a new one
   - Get approval from maintainers for major changes

2. **Local Development**
   - Use Node.js v22.12.0 or higher
   - Follow the project's code style
   - Ensure all tests pass locally

3. **Commit Guidelines**
   - Use conventional commits format
   - Keep commits focused and atomic
   - Include relevant issue numbers

## Pull Request Process

1. **Before Submitting**
   - Update documentation
   - Add/update tests
   - Run all tests locally
   - Update CHANGELOG.md

2. **PR Requirements**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test coverage report

3. **Review Process**
   - Address reviewer feedback
   - Keep PR scope focused
   - Maintain clean commit history

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for new code
- Follow ESLint configuration
- Use camelCase for variables/functions
- Use PascalCase for classes
- Use UPPERCASE_SNAKE_CASE for constants

### React Components
- Use functional components
- Implement proper prop types
- Follow component organization guidelines
- Use hooks appropriately

### Documentation
- Add JSDoc comments for functions/classes
- Keep README.md updated
- Document API changes
- Include inline comments for complex logic

## Testing Guidelines

### Unit Tests
- Write tests for new features
- Maintain >80% coverage
- Use meaningful test descriptions
- Follow arrange-act-assert pattern

### Integration Tests
- Test component integration
- Verify API interactions
- Test error scenarios
- Check edge cases

### Performance Tests
- Run performance benchmarks
- Test with realistic data loads
- Verify memory usage
- Check render performance
