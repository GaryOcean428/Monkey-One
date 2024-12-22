#!/bin/bash

# Check if we're in the scripts directory
if [ ! -f "./setup-github-secrets.sh" ]; then
    echo "Please run this script from the scripts directory"
    exit 1
fi

# Make all scripts executable
chmod +x setup-github-secrets.sh
chmod +x setup-vercel-secrets.sh

echo "Setting up GitHub Secrets..."
./setup-github-secrets.sh

echo "Setting up Vercel Secrets..."
./setup-vercel-secrets.sh

echo "All secrets have been configured successfully!"
echo "Please verify the secrets in:"
echo "1. GitHub repository settings"
echo "2. GitHub environment settings"
echo "3. Vercel project settings"
