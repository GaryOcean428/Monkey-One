#!/bin/bash

# Function to encode string to base64
encode_base64() {
  echo -n "$1" | base64
}

# Read from .env file
ENV_FILE="../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found"
    exit 1
fi

# GitHub repository details
REPO_OWNER="GaryOcean428"
REPO_NAME="monkey-one"

# Get GitHub token (you'll need to provide this when running the script)
echo "Please enter your GitHub Personal Access Token with repo access:"
read -s GITHUB_PAT
echo

# Create an array of secrets to add
declare -A SECRETS=(
    # Vercel Configuration
    ["VERCEL_TOKEN"]=$(grep VITE_VERCEL_TOKEN "$ENV_FILE" | cut -d '=' -f2)
    ["VERCEL_PROJECT_ID"]=$(grep VITE_VERCEL_PROJECT_ID "$ENV_FILE" | cut -d '=' -f2)
    ["VERCEL_ORG_ID"]=$(grep VITE_VERCEL_ORG_ID "$ENV_FILE" | cut -d '=' -f2)
    
    # GitHub Configuration
    ["GITHUB_TOKEN"]=$(grep VITE_GITHUB_TOKEN "$ENV_FILE" | cut -d '=' -f2)
    
    # Firebase Configuration
    ["FIREBASE_API_KEY"]=$(grep VITE_FIREBASE_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_PROJECT_ID"]=$(grep VITE_FIREBASE_PROJECT_ID "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_AUTH_DOMAIN"]=$(grep VITE_FIREBASE_AUTH_DOMAIN "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_STORAGE_BUCKET"]=$(grep VITE_FIREBASE_STORAGE_BUCKET "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_MESSAGING_SENDER_ID"]=$(grep VITE_FIREBASE_MESSAGING_SENDER_ID "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_APP_ID"]=$(grep VITE_FIREBASE_APP_ID "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_MEASUREMENT_ID"]=$(grep VITE_FIREBASE_MEASUREMENT_ID "$ENV_FILE" | cut -d '=' -f2)
    
    # Pinecone Configuration
    ["PINECONE_API_KEY"]=$(grep VITE_PINECONE_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["PINECONE_ENVIRONMENT"]=$(grep VITE_PINECONE_ENVIRONMENT "$ENV_FILE" | cut -d '=' -f2)
    
    # Database Configuration
    ["PG_USER"]=$(grep VITE_PG_USER "$ENV_FILE" | cut -d '=' -f2)
    ["PG_HOST"]=$(grep VITE_PG_HOST "$ENV_FILE" | cut -d '=' -f2)
    ["PG_DATABASE"]=$(grep VITE_PG_DATABASE "$ENV_FILE" | cut -d '=' -f2)
    ["PG_PASSWORD"]=$(grep VITE_PG_PASSWORD "$ENV_FILE" | cut -d '=' -f2)
    ["PG_PORT"]=$(grep VITE_PG_PORT "$ENV_FILE" | cut -d '=' -f2)
    
    # Redis Configuration
    ["REDIS_HOST"]=$(grep VITE_REDIS_HOST "$ENV_FILE" | cut -d '=' -f2)
    ["REDIS_PORT"]=$(grep VITE_REDIS_PORT "$ENV_FILE" | cut -d '=' -f2)
    ["REDIS_PASSWORD"]=$(grep VITE_REDIS_PASSWORD "$ENV_FILE" | cut -d '=' -f2)
    ["REDIS_API"]=$(grep VITE_REDIS_API "$ENV_FILE" | cut -d '=' -f2)
    ["REDIS_USERNAME"]=$(grep VITE_REDIS_USERNAME "$ENV_FILE" | cut -d '=' -f2)
    
    # AI Model API Keys
    ["XAI_API_KEY"]=$(grep VITE_XAI_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["GROQ_API_KEY"]=$(grep VITE_GROQ_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["PERPLEXITY_API_KEY"]=$(grep VITE_PERPLEXITY_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["HUGGINGFACE_TOKEN"]=$(grep VITE_HUGGINGFACE_TOKEN "$ENV_FILE" | cut -d '=' -f2)
    ["ANTHROPIC_API_KEY"]=$(grep VITE_ANTHROPIC_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    
    # Search & Integration APIs
    ["GOOGLE_API_KEY"]=$(grep VITE_GOOGLE_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["SERP_API_KEY"]=$(grep VITE_SERP_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["TOOLHOUSE_API_KEY"]=$(grep VITE_TOOLHOUSE_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    
    # Grafana Configuration
    ["GRAFANA_ADMIN_PASSWORD"]=$(grep GRAFANA_ADMIN_PASSWORD "$ENV_FILE" | cut -d '=' -f2)
)

# Function to add secrets to a specific environment
add_secrets_to_environment() {
    local env_name=$1
    local env_id
    
    # Create environment if it doesn't exist
    curl -X PUT \
        -H "Authorization: token $GITHUB_PAT" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/environments/$env_name"
    
    # Get public key for the environment
    PUBLIC_KEY_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_PAT" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key")

    KEY_ID=$(echo "$PUBLIC_KEY_RESPONSE" | grep -o '"key_id":"[^"]*' | cut -d'"' -f4)
    PUBLIC_KEY=$(echo "$PUBLIC_KEY_RESPONSE" | grep -o '"key":"[^"]*' | cut -d'"' -f4)

    if [ -z "$KEY_ID" ] || [ -z "$PUBLIC_KEY" ]; then
        echo "Error: Could not get public key information for environment $env_name"
        return 1
    fi

    # Add each secret to the environment
    for SECRET_NAME in "${!SECRETS[@]}"; do
        SECRET_VALUE="${SECRETS[$SECRET_NAME]}"
        ENCODED_VALUE=$(encode_base64 "$SECRET_VALUE")
        
        echo "Adding secret: $SECRET_NAME to environment: $env_name"
        
        curl -X PUT \
            -H "Authorization: token $GITHUB_PAT" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/environments/$env_name/secrets/$SECRET_NAME" \
            -d "{\"encrypted_value\":\"$ENCODED_VALUE\",\"key_id\":\"$KEY_ID\"}"
        
        echo
    done
}

# Add secrets to repository level
echo "Adding repository secrets..."
for SECRET_NAME in "${!SECRETS[@]}"; do
    SECRET_VALUE="${SECRETS[$SECRET_NAME]}"
    ENCODED_VALUE=$(encode_base64 "$SECRET_VALUE")
    
    echo "Adding repository secret: $SECRET_NAME"
    
    curl -X PUT \
        -H "Authorization: token $GITHUB_PAT" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$SECRET_NAME" \
        -d "{\"encrypted_value\":\"$ENCODED_VALUE\",\"key_id\":\"$KEY_ID\"}"
    
    echo
done

# Add secrets to environments
echo "Adding environment secrets..."
for env in "production" "development" "preview"; do
    echo "Setting up environment: $env"
    add_secrets_to_environment "$env"
done

echo "All secrets have been added successfully!"
