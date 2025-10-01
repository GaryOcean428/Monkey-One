# Dependency Management Strategy

## Overview
This document outlines our automated dependency management strategy using Dependabot with intelligent grouping and auto-merge capabilities.

## Configuration Summary

### Update Frequency
- **pnpm packages**: Monthly (1st Monday of each month at 9 AM UTC)
- **GitHub Actions**: Monthly (1st Monday of each month at 10 AM UTC)  
- **Docker**: Monthly (1st Monday of each month at 11 AM UTC)

### PR Limits
- **pnpm packages**: Maximum 5 open PRs
- **GitHub Actions**: Maximum 3 open PRs
- **Docker**: Maximum 2 open PRs

## Intelligent Grouping Strategy

### 1. React Ecosystem
**Group**: `react-ecosystem`
**Includes**: react, react-dom, @types/react*, react-*
**Auto-merge**: ✅ Minor/Patch updates only

### 2. TypeScript Tooling  
**Group**: `typescript-tooling`
**Includes**: typescript, @typescript-eslint/*, eslint*, prettier*, vite*, @vitejs/*
**Auto-merge**: ✅ Minor/Patch updates only

### 3. Testing Framework
**Group**: `testing-framework`  
**Includes**: vitest*, @vitest/*, @testing-library/*, playwright*, msw
**Auto-merge**: ✅ Minor/Patch updates only

### 4. UI & Styling
**Group**: `ui-styling`
**Includes**: @radix-ui/*, tailwindcss*, framer-motion, lucide-react, @heroicons/*
**Auto-merge**: ✅ Minor/Patch updates only

### 5. AI & ML Dependencies
**Group**: `ai-ml-dependencies`
**Includes**: openai, @ai-sdk/*, @huggingface/*, @tensorflow/*, ai
**Auto-merge**: ✅ Minor/Patch updates only

### 6. Database & Storage
**Group**: `database-storage`
**Includes**: @supabase/*, @pinecone-database/*, redis, ioredis
**Auto-merge**: ✅ Minor/Patch updates only

### 7. Development Utilities
**Group**: `dev-utilities`
**Includes**: All development dependencies
**Auto-merge**: ✅ Patch updates only

### 8. Security Updates
**Group**: `security-updates`
**Includes**: All security-related updates
**Auto-merge**: ✅ All security updates (fast-tracked)

## Auto-merge Rules

### ✅ Automatically Merged
1. **Security updates** - All security patches (fast-tracked)
2. **Patch updates** - Both production and development dependencies
3. **Development minor updates** - Development dependencies only
4. **GitHub Actions updates** - All updates
5. **Docker updates** - All updates (after CI passes)
6. **Labeled PRs** - PRs with `automerge` label

### ❌ Requires Manual Review
1. **Major version updates** - All major version bumps
2. **Production minor updates** - Minor updates to production dependencies
3. **Critical dependencies** - React, TypeScript, Node.js major updates

### 🚫 Ignored Dependencies
- `react` (major versions)
- `react-dom` (major versions)
- `@types/react` (major versions)
- `@types/react-dom` (major versions)
- `typescript` (major versions)
- `node` (major versions)
- `@types/node` (major versions)

## Workflow Process

### 1. PR Creation
- Dependabot creates grouped PRs monthly
- PRs are automatically labeled with `dependencies` and `automerge`
- Appropriate reviewers and assignees are set

### 2. Auto-approval
- Safe updates are automatically approved
- Approval comment explains the reasoning

### 3. CI Validation
- All PRs must pass CI checks before auto-merge
- Quality gates include: lint, test, build, security scan
- Timeout: 30 minutes for main CI, 15 minutes for security

### 4. Auto-merge Decision
- Intelligent logic determines merge eligibility
- Comments explain the decision reasoning
- Failed CI prevents auto-merge with explanation

### 5. Manual Intervention
- Major updates require manual review
- Failed CI requires manual investigation
- Override available via `automerge` label

## Monitoring & Alerts

### Success Metrics
- **Reduced PR volume**: ~80% reduction in individual dependency PRs
- **Faster security updates**: Security patches merged within hours
- **Maintained stability**: No breaking changes from auto-merged updates

### Alert Conditions
- CI failures on dependency updates
- Security vulnerabilities detected
- Major version updates available
- Auto-merge failures

## Emergency Procedures

### Security Vulnerabilities
1. Security updates are fast-tracked for immediate merge
2. Automatic approval and merge (bypasses normal wait times)
3. Post-merge security review if needed

### Breaking Changes
1. Auto-merge disabled for major versions
2. Manual testing required
3. Staged rollout if necessary

### CI Failures
1. Auto-merge cancelled automatically
2. Investigation comment added to PR
3. Manual intervention required

## Configuration Files

### Primary Configuration
- `.github/dependabot.yml` - Main Dependabot configuration
- `.github/workflows/dependabot-automerge.yml` - Auto-merge logic
- `.github/workflows/dependabot-approve.yml` - Auto-approval logic

### Related Workflows
- `.github/workflows/ci.yml` - Quality gates for auto-merge
- `.github/workflows/security.yml` - Security validation

## Best Practices

### For Developers
1. **Review grouped PRs** - Check the grouped changes make sense
2. **Monitor auto-merges** - Watch for any issues post-merge
3. **Override when needed** - Use `automerge` label for special cases
4. **Test major updates** - Always test major version updates manually

### For Maintainers
1. **Adjust grouping** - Modify groups based on actual usage patterns
2. **Monitor metrics** - Track success/failure rates
3. **Update rules** - Refine auto-merge rules based on experience
4. **Security first** - Always prioritize security updates

## Troubleshooting

### Common Issues
1. **Too many PRs** - Adjust grouping patterns or frequency
2. **Auto-merge failures** - Check CI configuration and timeouts
3. **Breaking changes** - Review ignored dependencies list
4. **Security delays** - Verify fast-track security workflow

### Debug Commands
```bash
# Check Dependabot configuration
gh api repos/:owner/:repo/dependabot/secrets

# List open Dependabot PRs
gh pr list --author "dependabot[bot]"

# Check workflow runs
gh run list --workflow=dependabot-automerge.yml
```

## Updates to This Strategy

This strategy should be reviewed and updated:
- **Monthly** - Review success metrics and adjust if needed
- **Quarterly** - Major review of grouping strategy
- **As needed** - When new dependency patterns emerge

Last updated: 2025-01-01
Next review: 2025-04-01