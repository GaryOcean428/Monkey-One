#!/bin/bash

# Read from .env file
ENV_FILE="../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Get Vercel token from .env
VERCEL_TOKEN=$(grep VITE_VERCEL_TOKEN "$ENV_FILE" | cut -d '=' -f2)
PROJECT_ID=$(grep VITE_VERCEL_PROJECT_ID "$ENV_FILE" | cut -d '=' -f2)

# Array of secrets to add
declare -A SECRETS=(
    # Firebase Configuration
    ["FIREBASE_API_KEY"]=$(grep VITE_FIREBASE_API_KEY "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_AUTH_DOMAIN"]=$(grep VITE_FIREBASE_AUTH_DOMAIN "$ENV_FILE" | cut -d '=' -f2)
    ["FIREBASE_PROJECT_ID"]=$(grep VITE_FIREBASE_PROJECT_ID "$ENV_FILE" | cut -d '=' -f2)
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
    
    # GitHub Configuration
    ["GITHUB_TOKEN"]=$(grep VITE_GITHUB_TOKEN "$ENV_FILE" | cut -d '=' -f2)
    ["GITHUB_USERNAME"]=$(grep VITE_GITHUB_USERNAME "$ENV_FILE" | cut -d '=' -f2)
    ["GITHUB_USEREMAIL"]=$(grep VITE_GITHUB_USEREMAIL "$ENV_FILE" | cut -d '=' -f2)
)

# Function to add secrets to a specific environment
add_secrets_to_environment() {
    local env=$1
    
    for SECRET_NAME in "${!SECRETS[@]}"; do
        SECRET_VALUE="${SECRETS[$SECRET_NAME]}"
        
        echo "Adding secret: $SECRET_NAME to environment: $env"
        
        # Add secret to Vercel project
        npx vercel secrets add "$SECRET_NAME" "$SECRET_VALUE" --token "$VERCEL_TOKEN" --yes
        
        # Link secret to environment
        npx vercel env add "VITE_$SECRET_NAME" "production" --token "$VERCEL_TOKEN" --yes <<< "$SECRET_NAME"
        
        echo
    done
}

# Add secrets to all environments
for env in "production" "preview" "development"; do
    echo "Setting up environment: $env"
    add_secrets_to_environment "$env"
done

echo "All Vercel secrets have been added successfully!"
