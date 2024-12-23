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
    -t, --token TOKEN      Vercel token (optional)
    --hook NAME            Create deploy hook with specified name
    --branch BRANCH        Branch to deploy (default: main)
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
        -t|--token)
            VERCEL_TOKEN="$2"
            shift 2
            ;;
        --hook)
            HOOK_NAME="$2"
            shift 2
            ;;
        --branch)
            BRANCH_NAME="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# If hook name is provided, create deploy hook
if [ -n "$HOOK_NAME" ]; then
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would create deploy hook: $HOOK_NAME for branch: ${BRANCH_NAME:-main}"
    else
        log_info "Creating deploy hook: $HOOK_NAME for branch: ${BRANCH_NAME:-main}"
        RESPONSE=$(curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_$VERCEL_PROJECT_ID" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$HOOK_NAME\",\"branch\":\"${BRANCH_NAME:-main}\"}")
        
        if echo "$RESPONSE" | grep -q "\"id\""; then
            HOOK_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
            log_success "Deploy hook created successfully!"
            log_info "Deploy hook URL: $HOOK_URL"
            
            # Save hook URL to environment file if specified
            if [ -n "$ENV_FILE" ]; then
                echo "VERCEL_DEPLOY_HOOK_URL=$HOOK_URL" >> "$ENV_FILE"
                log_success "Deploy hook URL saved to $ENV_FILE"
            fi
        else
            log_error "Failed to create deploy hook: $RESPONSE"
            exit 1
        fi
    fi
fi

# Continue with existing secret setup...
