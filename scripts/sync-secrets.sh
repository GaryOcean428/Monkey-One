#!/bin/bash

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first:"
    echo "curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && sudo apt update \
    && sudo apt install gh -y"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Check if user is authenticated with Vercel CLI
if ! vercel whoami &> /dev/null; then
    echo "Please authenticate with Vercel first:"
    echo "vercel login"
    exit 1
fi

# Get the repository name from git config
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:\/]\(.*\).git/\1/')

# Check if .vercel/project.json exists
if [ ! -f .vercel/project.json ]; then
    echo "Vercel project configuration not found. Please link your project first:"
    echo "vercel link"
    exit 1
fi

# Function to sync a secret to both GitHub and Vercel
sync_secret() {
    local key=$1
    local value=$2
    local is_secret=$3

    # Sync to GitHub
    if [ "$is_secret" = true ]; then
        echo "Setting GitHub secret: $key"
        echo "$value" | gh secret set "$key" --repo="$REPO_NAME" 2>/dev/null || {
            echo "Failed to set GitHub secret $key, trying as environment variable..."
            gh variable set "$key" --body="$value" --repo="$REPO_NAME" 2>/dev/null || {
                echo "Failed to set $key as either secret or variable on GitHub"
            }
        }
    else
        echo "Setting GitHub variable: $key"
        gh variable set "$key" --body="$value" --repo="$REPO_NAME" 2>/dev/null || {
            echo "Failed to set GitHub variable $key"
        }
    fi

    # Sync to Vercel
    echo "Setting Vercel environment variable: $key"
    if [ "$is_secret" = true ]; then
        echo "$value" | vercel env add "$key" production --secret || {
            echo "Failed to set Vercel secret $key for production"
        }
        echo "$value" | vercel env add "$key" preview --secret || {
            echo "Failed to set Vercel secret $key for preview"
        }
        echo "$value" | vercel env add "$key" development --secret || {
            echo "Failed to set Vercel secret $key for development"
        }
    else
        echo "$value" | vercel env add "$key" production || {
            echo "Failed to set Vercel variable $key for production"
        }
        echo "$value" | vercel env add "$key" preview || {
            echo "Failed to set Vercel variable $key for preview"
        }
        echo "$value" | vercel env add "$key" development || {
            echo "Failed to set Vercel variable $key for development"
        }
    fi
}

# Read .env file and create secrets
if [ -f .env ]; then
    echo "Reading .env file..."
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        if [ -z "$key" ] || [[ $key == \#* ]]; then
            continue
        fi
        
        # Remove any quotes from the value
        value=$(echo $value | sed 's/^["\x27]//' | sed 's/["\x27]$//')
        
        # Trim whitespace
        key=$(echo $key | xargs)
        value=$(echo $value | xargs)
        
        if [ ! -z "$key" ] && [ ! -z "$value" ]; then
            # Determine if this should be a secret based on key name
            is_secret=false
            if [[ $key == *"KEY"* ]] || [[ $key == *"SECRET"* ]] || [[ $key == *"TOKEN"* ]] || [[ $key == *"PASSWORD"* ]] || [[ $key == *"PRIVATE"* ]]; then
                is_secret=true
            fi
            
            sync_secret "$key" "$value" "$is_secret"
        fi
    done < .env
    echo "Finished syncing secrets and variables!"
else
    echo ".env file not found!"
    exit 1
fi

# Verify the secrets were set
echo -e "\nVerifying GitHub secrets and variables..."
echo "GitHub Secrets:"
gh secret list --repo="$REPO_NAME"
echo -e "\nGitHub Variables:"
gh variable list --repo="$REPO_NAME"

echo -e "\nVerifying Vercel environment variables..."
vercel env ls

# Deploy the changes to Vercel
echo -e "\nDeploying environment changes to Vercel..."
vercel env pull .env.local
vercel env push
