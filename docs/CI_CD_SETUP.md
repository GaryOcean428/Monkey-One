# CI/CD Setup - 2025 Best Practices

This document outlines the comprehensive CI/CD setup implemented for the Monkey-One project, following 2025 best practices for modern web development.

## Overview

Our CI/CD pipeline includes:
- **Pre-commit hooks** for local quality gates
- **GitHub Actions workflows** for automated testing and deployment
- **Security scanning** and vulnerability management
- **Performance monitoring** and optimization
- **Automated dependency management**

## Pre-commit Hooks (Husky)

### Configuration
- **Husky v9+** with modern configuration format
- **lint-staged** for efficient file processing
- **Conventional Commits** enforcement

### Hooks

#### `pre-commit`
Runs on every commit attempt:
- ✅ **Lint-staged**: Format and lint only staged files
- ✅ **Type checking**: Full TypeScript validation
- ✅ **Security audit**: Check for vulnerabilities
- ✅ **Secret scanning**: Prevent accidental secret commits

#### `commit-msg`
Validates commit message format:
- ✅ **Conventional Commits**: Enforces standard format
- ✅ **Message length**: Warns about long messages
- ✅ **Type validation**: Ensures proper commit types

#### `pre-push`
Runs before pushing to remote:
- ✅ **Test suite**: Full test execution
- ✅ **Build validation**: Ensures code builds successfully
- ✅ **Dependency check**: Validates dependencies
- ✅ **Large file detection**: Prevents large file commits

### Usage
```bash
# Hooks run automatically, but you can also run manually:
pnpm run pre-commit    # Run lint-staged only
pnpm run validate      # Run all quality checks
```

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to main/develop, Pull requests
**Jobs**:
- **Lint & Format**: Code quality checks
- **Test**: Multi-version Node.js testing with coverage
- **Build**: Application build validation
- **Security**: CodeQL analysis and vulnerability scanning
- **E2E**: End-to-end testing (conditional)
- **Quality Gate**: Final validation

**Features**:
- ✅ **Concurrency control**: Cancel outdated runs
- ✅ **Matrix testing**: Node.js 18.x and 20.x
- ✅ **Coverage reporting**: Codecov integration
- ✅ **Artifact management**: Build artifacts with retention
- ✅ **Performance optimization**: Efficient caching

### 2. Security Workflow (`.github/workflows/security.yml`)

**Triggers**: Push, Pull requests, Daily schedule (2 AM UTC)
**Jobs**:
- **Secret Scanning**: Trivy secret detection
- **Vulnerability Scanning**: Dependency and container scanning
- **License Compliance**: License validation
- **SAST**: Static Application Security Testing
- **Semgrep**: Advanced security pattern detection

**Features**:
- ✅ **SARIF reporting**: GitHub Security tab integration
- ✅ **Daily scans**: Automated security monitoring
- ✅ **License enforcement**: Approved license validation
- ✅ **Multi-tool approach**: Comprehensive security coverage

### 3. Performance Workflow (`.github/workflows/performance.yml`)

**Triggers**: Push to main, Pull requests, Weekly schedule
**Jobs**:
- **Lighthouse Audit**: Performance, accessibility, SEO
- **Bundle Analysis**: Bundle size monitoring
- **Load Testing**: k6-based performance testing

**Features**:
- ✅ **Performance budgets**: Automated performance validation
- ✅ **Bundle visualization**: Size analysis and optimization
- ✅ **Load testing**: Production-like performance validation

### 4. Deployment Workflow (`.github/workflows/vercel-deploy.yml`)

**Triggers**: Push to main/develop, Pull requests
**Jobs**:
- **Preview Deployment**: PR preview environments
- **Production Deployment**: Main branch deployments

**Features**:
- ✅ **Environment management**: Separate preview/production
- ✅ **PR comments**: Automatic preview URL posting
- ✅ **Deployment status**: GitHub deployment tracking
- ✅ **Optimized caching**: Efficient build processes

### 5. Release Workflow (`.github/workflows/release.yml`)

**Triggers**: Push to main (excluding docs)
**Features**:
- ✅ **Automated releases**: Release Please integration
- ✅ **Changelog generation**: Conventional commit-based
- ✅ **Artifact management**: Release asset handling
- ✅ **Semantic versioning**: Automated version bumping

### 6. Dependency Review (`.github/workflows/dependency-review.yml`)

**Triggers**: Pull requests
**Features**:
- ✅ **Dependency analysis**: Security and license review
- ✅ **PR integration**: Automated review comments
- ✅ **Policy enforcement**: License and security policies

## Dependabot Configuration

### Features
- ✅ **Multi-ecosystem**: npm, GitHub Actions, Docker
- ✅ **Grouped updates**: Logical dependency grouping
- ✅ **Security prioritization**: Automatic security updates
- ✅ **Review automation**: Automated assignment and labeling

### Update Schedule
- **Weekly updates**: Monday 9 AM UTC
- **Security updates**: Immediate
- **Major version updates**: Manual review required

## Quality Gates

### Pre-commit (Local)
1. Code formatting and linting
2. Type checking
3. Security audit
4. Secret detection

### CI Pipeline
1. Multi-version testing
2. Build validation
3. Security scanning
4. Performance validation
5. E2E testing (conditional)

### Deployment
1. All CI checks pass
2. Security scan clean
3. Performance budget met
4. Manual approval (production)

## Security Features

### Scanning Tools
- **Trivy**: Container and filesystem scanning
- **CodeQL**: Static analysis security testing
- **Semgrep**: Pattern-based security detection
- **npm audit**: Dependency vulnerability scanning

### Policies
- **License allowlist**: MIT, Apache-2.0, BSD variants, ISC
- **License denylist**: GPL variants, AGPL
- **Vulnerability threshold**: Moderate and above
- **Secret detection**: API keys, tokens, passwords

## Performance Monitoring

### Metrics
- **Lighthouse scores**: Performance, accessibility, SEO
- **Bundle size**: JavaScript and CSS bundle analysis
- **Load testing**: Response time and throughput
- **Core Web Vitals**: User experience metrics

### Thresholds
- **Performance**: >80 Lighthouse score
- **Accessibility**: >90 Lighthouse score
- **Bundle size**: Monitored with warnings
- **Response time**: <500ms p95

## Environment Variables

### Required Secrets
```bash
# Vercel deployment
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Code coverage
CODECOV_TOKEN

# Security scanning (optional)
SEMGREP_APP_TOKEN
```

### Configuration
- **Development**: `.env.local`
- **Production**: Vercel environment variables
- **CI**: GitHub repository secrets

## Troubleshooting

### Common Issues

#### Pre-commit Hook Failures
```bash
# Fix formatting issues
pnpm run format

# Fix linting issues
pnpm run lint:fix

# Fix type errors
pnpm run type-check
```

#### CI Failures
1. **Test failures**: Check test logs and fix failing tests
2. **Build failures**: Verify dependencies and build configuration
3. **Security failures**: Review security scan results and fix vulnerabilities
4. **Performance failures**: Optimize bundle size and performance

#### Deployment Issues
1. **Environment variables**: Verify all required secrets are set
2. **Build configuration**: Check Vercel build settings
3. **Dependencies**: Ensure all dependencies are properly installed

## Best Practices

### Commit Messages
```bash
# Good examples
feat: add user authentication system
fix(api): resolve memory leak in agent processing
docs: update installation guide
perf: optimize bundle size by 15%

# Bad examples
fix stuff
update code
changes
```

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **hotfix/***: Critical fixes

### Pull Request Process
1. Create feature branch from develop
2. Implement changes with tests
3. Ensure all pre-commit hooks pass
4. Create PR with descriptive title and description
5. Wait for CI validation
6. Address review feedback
7. Merge after approval

## Monitoring and Alerts

### GitHub Notifications
- **Failed workflows**: Immediate notification
- **Security alerts**: Dependabot security advisories
- **Performance degradation**: Lighthouse score drops

### Metrics Dashboard
- **GitHub Actions**: Workflow success rates
- **Vercel**: Deployment metrics
- **Codecov**: Coverage trends
- **Security**: Vulnerability trends

## Maintenance

### Regular Tasks
- **Weekly**: Review Dependabot PRs
- **Monthly**: Security scan review
- **Quarterly**: Performance audit
- **Annually**: Workflow optimization review

### Updates
- **Dependencies**: Automated via Dependabot
- **Actions**: Automated via Dependabot
- **Tools**: Manual review and update
- **Policies**: Regular review and adjustment

This CI/CD setup ensures high code quality, security, and performance while maintaining developer productivity and deployment reliability.