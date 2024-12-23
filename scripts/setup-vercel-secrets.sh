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
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Function to add a secret to Vercel
add_secret() {
    local name=$1
    local value=$2
    local environment=${3:-production}

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would add secret: $name to environment: $environment"
        return 0
    }

    # Remove any existing secret
    vercel secrets rm "$name" -y > /dev/null 2>&1 || true
    
    # Add the new secret
    echo "$value" | vercel secrets add "$name" - --env "$environment"
}

# Add required secrets
if [ -f "$ENV_FILE" ]; then
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Clean the key and value
        key=$(echo "$key" | tr -d ' ')
        value=$(echo "$value" | tr -d '"' | tr -d "'")
        
        # Convert environment variable names to Vercel secret names
        secret_name=$(echo "$key" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
        
        # Add the secret to Vercel
        add_secret "$secret_name" "$value"
    done < "$ENV_FILE"
fi

log_success "Vercel secrets setup completed!"
