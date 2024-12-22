#!/bin/bash

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/secrets-utils.sh"

# Default values
DRY_RUN=false
ENV_FILE="../.env"

# Function to show usage
show_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Options:
    -h, --help              Show this help message
    -d, --dry-run          Show what would be done without making changes
    -e, --env FILE         Specify environment file (default: ../.env)
    --env-prod FILE        Production environment file
    --env-dev FILE         Development environment file
    --env-preview FILE     Preview environment file
    -g, --github-token TOKEN    GitHub Personal Access Token (optional)
    -v, --vercel-token TOKEN    Vercel token (optional)
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        --env-prod)
            ENV_PROD="$2"
            shift 2
            ;;
        --env-dev)
            ENV_DEV="$2"
            shift 2
            ;;
        --env-preview)
            ENV_PREVIEW="$2"
            shift 2
            ;;
        -g|--github-token)
            GITHUB_TOKEN="$2"
            shift 2
            ;;
        -v|--vercel-token)
            VERCEL_TOKEN="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment files
validate_env_file "$ENV_FILE" || exit 1
[ -n "$ENV_PROD" ] && validate_env_file "$ENV_PROD"
[ -n "$ENV_DEV" ] && validate_env_file "$ENV_DEV"
[ -n "$ENV_PREVIEW" ] && validate_env_file "$ENV_PREVIEW"

# Build arguments for GitHub secrets script
GITHUB_ARGS=()
[ "$DRY_RUN" = true ] && GITHUB_ARGS+=("--dry-run")
[ -n "$ENV_FILE" ] && GITHUB_ARGS+=("--env" "$ENV_FILE")
[ -n "$ENV_PROD" ] && GITHUB_ARGS+=("--env-prod" "$ENV_PROD")
[ -n "$ENV_DEV" ] && GITHUB_ARGS+=("--env-dev" "$ENV_DEV")
[ -n "$ENV_PREVIEW" ] && GITHUB_ARGS+=("--env-preview" "$ENV_PREVIEW")
[ -n "$GITHUB_TOKEN" ] && GITHUB_ARGS+=("--token" "$GITHUB_TOKEN")

# Build arguments for Vercel secrets script
VERCEL_ARGS=()
[ "$DRY_RUN" = true ] && VERCEL_ARGS+=("--dry-run")
[ -n "$ENV_FILE" ] && VERCEL_ARGS+=("--env" "$ENV_FILE")
[ -n "$ENV_PROD" ] && VERCEL_ARGS+=("--env-prod" "$ENV_PROD")
[ -n "$ENV_DEV" ] && VERCEL_ARGS+=("--env-dev" "$ENV_DEV")
[ -n "$ENV_PREVIEW" ] && VERCEL_ARGS+=("--env-preview" "$ENV_PREVIEW")
[ -n "$VERCEL_TOKEN" ] && VERCEL_ARGS+=("--token" "$VERCEL_TOKEN")

# Run GitHub secrets script
log_info "Setting up GitHub secrets..."
if ! "$SCRIPT_DIR/setup-github-secrets.sh" "${GITHUB_ARGS[@]}"; then
    log_error "Failed to set up GitHub secrets"
    exit 1
fi

# Run Vercel secrets script
log_info "Setting up Vercel secrets..."
if ! "$SCRIPT_DIR/setup-vercel-secrets.sh" "${VERCEL_ARGS[@]}"; then
    log_error "Failed to set up Vercel secrets"
    exit 1
fi

log_success "All secrets have been set up successfully!"
