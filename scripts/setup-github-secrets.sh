#!/bin/bash

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/secrets-utils.sh"

# Default values
DRY_RUN=false
ENV_FILE="../.env"
ENVIRONMENTS=("production" "development" "preview")

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
    -t, --token TOKEN      GitHub Personal Access Token (optional)
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
            GITHUB_PAT="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate dependencies
check_command curl || exit 1
check_command base64 || exit 1

# Validate environment files
validate_env_file "$ENV_FILE" || exit 1
[ -n "$ENV_PROD" ] && validate_env_file "$ENV_PROD"
[ -n "$ENV_DEV" ] && validate_env_file "$ENV_DEV"
[ -n "$ENV_PREVIEW" ] && validate_env_file "$ENV_PREVIEW"

# Create backup of environment files
backup_env_file "$ENV_FILE"
[ -n "$ENV_PROD" ] && backup_env_file "$ENV_PROD"
[ -n "$ENV_DEV" ] && backup_env_file "$ENV_DEV"
[ -n "$ENV_PREVIEW" ] && backup_env_file "$ENV_PREVIEW"

# GitHub repository details
REPO_OWNER="GaryOcean428"
REPO_NAME="monkey-one"

# If no GitHub token provided, try to get it from environment file
if [ -z "$GITHUB_PAT" ]; then
    GITHUB_PAT=$(get_env_value "$ENV_FILE" "VITE_GITHUB_TOKEN")
    if [ -z "$GITHUB_PAT" ]; then
        log_error "No GitHub token provided. Use --token or set VITE_GITHUB_TOKEN in environment file"
        exit 1
    fi
fi

# Validate GitHub token
check_github_token "$GITHUB_PAT" "$DRY_RUN" || exit 1

# Function to get environment file for a specific environment
get_env_file_for_environment() {
    local env=$1
    case $env in
        production)
            echo "${ENV_PROD:-$ENV_FILE}"
            ;;
        development)
            echo "${ENV_DEV:-$ENV_FILE}"
            ;;
        preview)
            echo "${ENV_PREVIEW:-$ENV_FILE}"
            ;;
        *)
            echo "$ENV_FILE"
            ;;
    esac
}

# Function to load secrets from environment file
load_secrets() {
    local env_file=$1
    declare -gA SECRETS
    
    # Load all VITE_ prefixed variables
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Remove VITE_ prefix for secret name
        secret_name=${key#VITE_}
        SECRETS["$secret_name"]=$value
    done < <(grep '^VITE_' "$env_file")
    
    # Add non-VITE variables that we want to include
    SECRETS["GRAFANA_ADMIN_PASSWORD"]=$(get_env_value "$env_file" "GRAFANA_ADMIN_PASSWORD")
}

# Function to add secrets to a specific environment
add_secrets_to_environment() {
    local env_name=$1
    local env_file=$(get_env_file_for_environment "$env_name")
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would create environment: $env_name"
        return 0
    fi
    
    # Load secrets for this environment
    load_secrets "$env_file"
    
    # Create environment if it doesn't exist
    local response
    response=$(curl -s -X PUT \
        -H "Authorization: token $GITHUB_PAT" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/environments/$env_name")
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create environment: $env_name"
        return 1
    fi
    
    # Get public key for the environment
    local key_response
    key_response=$(curl -s -H "Authorization: token $GITHUB_PAT" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key")
    
    local key_id
    local public_key
    key_id=$(echo "$key_response" | grep -o '"key_id":"[^"]*' | cut -d'"' -f4)
    public_key=$(echo "$key_response" | grep -o '"key":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$key_id" ] || [ -z "$public_key" ]; then
        log_error "Could not get public key information for environment $env_name"
        return 1
    fi
    
    # Add each secret to the environment
    for secret_name in "${!SECRETS[@]}"; do
        local secret_value="${SECRETS[$secret_name]}"
        local encoded_value
        encoded_value=$(encode_base64 "$secret_value")
        
        if [ "$DRY_RUN" = true ]; then
            log_info "[DRY RUN] Would add secret: $secret_name to environment: $env_name"
            continue
        fi
        
        log_info "Adding secret: $secret_name to environment: $env_name"
        
        local secret_response
        secret_response=$(curl -s -X PUT \
            -H "Authorization: token $GITHUB_PAT" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/environments/$env_name/secrets/$secret_name" \
            -d "{\"encrypted_value\":\"$encoded_value\",\"key_id\":\"$key_id\"}")
        
        if [ $? -ne 0 ]; then
            log_error "Failed to add secret: $secret_name to environment: $env_name"
            continue
        fi
        
        log_success "Added secret: $secret_name to environment: $env_name"
    done
}

# Main execution
if [ "$DRY_RUN" = true ]; then
    log_info "Running in dry-run mode. No changes will be made."
fi

# Add secrets to each environment
for env in "${ENVIRONMENTS[@]}"; do
    log_info "Setting up environment: $env"
    add_secrets_to_environment "$env"
done

log_success "GitHub secrets setup completed successfully!"
