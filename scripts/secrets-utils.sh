#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

log_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

log_info() {
    echo "$1"
}

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is required but not installed."
        return 1
    fi
}

# Function to validate environment file
validate_env_file() {
    local env_file=$1
    
    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    # Create a backup
    local backup_file="$env_file.backup-$(date +%Y%m%d-%H%M%S)"
    cp "$env_file" "$backup_file"
    log_success "Created backup: $backup_file"
    
    # Remove Windows line endings and empty lines
    local temp_file=$(mktemp)
    tr -d '\r' < "$env_file" | grep -v '^[[:space:]]*$' > "$temp_file"
    mv "$temp_file" "$env_file"
    
    return 0
}

# Function to get environment value
get_env_value() {
    local env_file=$1
    local key=$2
    local value
    
    # Read the value, removing any Windows line endings
    value=$(grep "^$key=" "$env_file" | cut -d'=' -f2- | tr -d '\r')
    
    # Remove any surrounding quotes
    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"
    
    echo "$value"
}

# Function to clean environment value (remove quotes, spaces, and \r)
clean_env_value() {
    local value=$1
    # Remove leading/trailing whitespace, quotes, and carriage returns
    value=$(echo "$value" | sed -e 's/^[[:space:]"'\'']*//g' -e 's/[[:space:]"'\'']*$//g' -e 's/\r//g')
    echo "$value"
}

# Function to check required environment variables
check_required_vars() {
    local env_file=$1
    shift
    local missing=0
    
    for var in "$@"; do
        if [ -z "$(get_env_value "$env_file" "$var")" ]; then
            log_error "Required variable $var is missing or empty in $env_file"
            missing=1
        fi
    done
    
    return $missing
}

# Function to encode string to base64
encode_base64() {
    echo -n "$1" | base64
}

# Function to check GitHub token
check_github_token() {
    local token=$1
    local dry_run=$2
    
    if [ "$dry_run" = true ]; then
        log_info "[DRY RUN] Would check GitHub token: ${token:0:4}..."
        return 0
    fi
    
    # Test the token with a GitHub API call
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $token" \
        "https://api.github.com/user")
    
    if [ "$response" = "200" ]; then
        log_success "GitHub token is valid"
        return 0
    else
        log_error "Invalid GitHub token (HTTP $response)"
        return 1
    fi
}

# Function to check Vercel token
check_vercel_token() {
    local token=$1
    local dry_run=$2
    
    if [ "$dry_run" = true ]; then
        log_info "[DRY RUN] Would check Vercel token: ${token:0:4}..."
        return 0
    fi
    
    # Test the token with a Vercel API call
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" \
        "https://api.vercel.com/v2/user")
    
    if [ "$response" = "200" ]; then
        log_success "Vercel token is valid"
        return 0
    else
        log_error "Invalid Vercel token (HTTP $response)"
        return 1
    fi
}

# Function to backup environment file
backup_env_file() {
    local env_file=$1
    local backup_file="${env_file}.backup-$(date +%Y%m%d-%H%M%S)"
    
    cp "$env_file" "$backup_file" || {
        log_error "Failed to create backup of $env_file"
        return 1
    }
    
    log_success "Created backup: $backup_file"
    return 0
}
