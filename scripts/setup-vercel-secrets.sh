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

# Validate dependencies
check_command npx || exit 1

# Validate environment files
validate_env_file "$ENV_FILE" || exit 1
[ -n "$ENV_PROD" ] && validate_env_file "$ENV_PROD"
[ -n "$ENV_DEV" ] && validate_env_file "$ENV_DEV"
[ -n "$ENV_PREVIEW" ] && validate_env_file "$ENV_PREVIEW"

# If no Vercel token provided, try to get it from environment file
if [ -z "$VERCEL_TOKEN" ]; then
    VERCEL_TOKEN=$(get_env_value "$ENV_FILE" "VITE_VERCEL_TOKEN")
    if [ -z "$VERCEL_TOKEN" ]; then
        log_error "No Vercel token provided. Use --token or set VITE_VERCEL_TOKEN in environment file"
        exit 1
    fi
fi

# Clean the token
VERCEL_TOKEN=$(clean_env_value "$VERCEL_TOKEN")

# Validate Vercel token
check_vercel_token "$VERCEL_TOKEN" "$DRY_RUN" || exit 1

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
        value=$(clean_env_value "$value")
        SECRETS["$secret_name"]=$value
    done < <(grep '^VITE_' "$env_file")
}

# Function to link Vercel project
link_vercel_project() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would link Vercel project"
        return 0
    fi
    
    log_info "Linking Vercel project..."
    
    # First try to link using the token
    if ! npx vercel link --token "$VERCEL_TOKEN" --yes; then
        log_error "Failed to link Vercel project"
        return 1
    fi
    
    # Pull the project settings
    if ! npx vercel pull --token "$VERCEL_TOKEN" --yes; then
        log_warning "Failed to pull project settings"
    fi
    
    log_success "Successfully linked Vercel project"
    return 0
}

# Function to add secrets to a specific environment
add_secrets_to_environment() {
    local env=$1
    local env_file=$(get_env_file_for_environment "$env")
    
    # Load secrets for this environment
    load_secrets "$env_file"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] Would add secrets to Vercel environment: $env"
        for secret_name in "${!SECRETS[@]}"; do
            log_info "[DRY RUN] Would add secret: $secret_name"
        done
        return 0
    fi
    
    # Make sure project is linked first
    link_vercel_project || return 1
    
    for secret_name in "${!SECRETS[@]}"; do
        local secret_value="${SECRETS[$secret_name]}"
        
        log_info "Adding secret: $secret_name to environment: $env"
        
        # Add environment variable with target environment
        if ! npx vercel env rm "VITE_$secret_name" "$env" --token "$VERCEL_TOKEN" --yes; then
            log_warning "Could not remove existing secret: $secret_name (this is normal if it doesn't exist)"
        fi
        
        if ! npx vercel env add "VITE_$secret_name" "$env" --token "$VERCEL_TOKEN" <<< "$secret_value"; then
            log_error "Failed to add secret: $secret_name"
            continue
        fi
        
        log_success "Added secret: $secret_name to environment: $env"
    done
    
    # Deploy the environment variables
    if ! npx vercel env pull .env.$env --token "$VERCEL_TOKEN" --yes; then
        log_warning "Failed to pull environment variables to .env.$env"
    fi
}

# Main execution
if [ "$DRY_RUN" = true ]; then
    log_info "Running in dry-run mode. No changes will be made."
fi

# Add secrets to each environment
for env in "production" "preview" "development"; do
    log_info "Setting up environment: $env"
    add_secrets_to_environment "$env"
done

log_success "Vercel secrets setup completed successfully!"
