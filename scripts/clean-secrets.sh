#!/bin/bash

# Exit on any error
set -e

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  echo "Please set it with: export GITHUB_TOKEN=your_token"
  exit 1
fi

# Clean up any existing directories
echo "Cleaning up existing directories..."
cd ..
rm -rf Monkey-One-clean

# Create a backup of the current directory
echo "Creating backup..."
backup_dir="Monkey-One-backup-$(date +%Y%m%d_%H%M%S)"
cp -r Monkey-One "$backup_dir"

# Clone a fresh copy
echo "Cloning fresh copy..."
git clone "https://$GITHUB_TOKEN@github.com/GaryOcean428/Monkey-One.git" Monkey-One-clean
cd Monkey-One-clean

# Remove all environment and secret files from history
echo "Removing sensitive files from history..."
git filter-repo \
  --invert-paths \
  --path='.env' \
  --path='.env.vercel' \
  --path='.env.new' \
  --path='.env.local' \
  --path='.env.development.local' \
  --path='.env.test.local' \
  --path='.env.production.local' \
  --force

# Create clean environment files
echo "Creating clean environment files..."
cat > .env.template << EOL
# Application
NODE_ENV=development
PORT=3000

# API Keys (replace with your own values)
ANTHROPIC_API_KEY=your-api-key
GITHUB_TOKEN=your-github-token

# Sentry
SENTRY_DSN=your-sentry-dsn

# Database
DATABASE_URL=your-database-url

# Other configurations
LOG_LEVEL=debug
EOL

cp .env.template .env.example

# Update .gitignore
echo "Updating .gitignore..."
cat > .gitignore << EOL
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
build
dist

# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.vercel
.env.new

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Vercel
.vercel
EOL

# Initialize git and create initial commit
echo "Creating initial commit..."
git add .
git commit -m "chore: initialize repository with clean environment files"

# Force push the changes
echo "Force pushing changes..."
git remote add origin "https://$GITHUB_TOKEN@github.com/GaryOcean428/Monkey-One.git"
git branch -M main
git push -u origin main --force

echo "Done! The repository has been cleaned of sensitive files."
echo "Please cd into ../Monkey-One-clean and continue working from there."
echo "A backup of your old repository is in ../$backup_dir"
