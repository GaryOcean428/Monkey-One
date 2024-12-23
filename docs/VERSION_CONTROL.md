# Version Control & Release Process

## Branching Strategy

We follow a modified GitFlow workflow:

### Main Branches
- `main`: Production-ready code
- `develop`: Integration branch for features

### Supporting Branches
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation
- `hotfix/*`: Production fixes

## Branch Naming Convention

```
feature/description-in-kebab-case
bugfix/issue-number-description
release/v1.2.3
hotfix/critical-issue-fix
```

## Commit Guidelines

1. **Conventional Commits**
```
type(scope): description

[optional body]

[optional footer]
```

2. **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Pull Request Process

1. **Creation**
   - Create from feature branch to develop
   - Fill PR template
   - Link related issues

2. **Review**
   - Required approvals: 2
   - Pass CI checks
   - Update documentation

3. **Merge**
   - Squash and merge
   - Delete source branch
   - Update tickets

## Release Process

1. **Preparation**
   ```bash
   # Create release branch
   git checkout -b release/v1.2.3 develop
   
   # Update version
   npm version 1.2.3
   
   # Update changelog
   npm run update-changelog
   ```

2. **Testing**
   ```bash
   # Run full test suite
   npm run test:full
   
   # Run integration tests
   npm run test:integration
   ```

3. **Release**
   ```bash
   # Merge to main
   git checkout main
   git merge release/v1.2.3
   
   # Tag release
   git tag -a v1.2.3 -m "Release v1.2.3"
   
   # Push
   git push origin main --tags
   ```

## Version Numbering

We use Semantic Versioning (SemVer):

- MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes
  - MINOR: New features
  - PATCH: Bug fixes

## Changelog Management

1. **Format**
```markdown
# Changelog

## [1.2.3] - 2024-12-23

### Added
- New feature X
- Support for Y

### Changed
- Updated dependency Z
- Improved performance

### Fixed
- Bug in component A
- Issue with API B
```

2. **Generation**
```bash
# Generate changelog
npm run generate-changelog

# Review and edit
code CHANGELOG.md
```

## Hotfix Process

1. Branch from main
```bash
git checkout -b hotfix/critical-fix main
```

2. Fix and test
```bash
# Make fixes
git commit -m "fix: critical issue"

# Run tests
npm test
```

3. Merge to main and develop
```bash
# Merge to main
git checkout main
git merge hotfix/critical-fix

# Merge to develop
git checkout develop
git merge hotfix/critical-fix
```

## CI/CD Integration

1. **Pull Requests**
- Run tests
- Check coverage
- Lint code
- Build check

2. **Release**
- Build artifacts
- Run security scan
- Deploy to staging
- Run smoke tests

## Best Practices

1. **Branch Management**
   - Regular cleanup
   - Protected branches
   - Branch policies

2. **Code Review**
   - Review checklist
   - Documentation updates
   - Test coverage

3. **Release Quality**
   - QA signoff
   - Security review
   - Performance check
