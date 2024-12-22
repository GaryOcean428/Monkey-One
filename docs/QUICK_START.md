# Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/monkey-one.git

# Install dependencies
cd monkey-one
npm install

# Set up environment variables
cp .env.production.example .env.production
cp .env.test.example .env.test

# Update the environment files with your configuration
# IMPORTANT: Never commit .env files to git!

# Start the development server
npm run dev
```

## Environment Setup

1. **Configure Environment Variables**
   - Copy `.env.production.example` to `.env.production`
   - Copy `.env.test.example` to `.env.test`
   - Update the files with your actual configuration values
   - Never commit these files to git - they are already in .gitignore

2. **Required Environment Variables**
   - Firebase configuration
   - API keys for LLM providers
   - Database credentials
   - See `.env.production.example` for all required variables

## First Steps

1. **Open the Application**
   - Navigate to <http://localhost:3000>
   - Login or use demo mode

2. **Start a Conversation**
   - Click the chat interface
   - Describe your automation needs
   - Follow agent suggestions

3. **Create Your First Workflow**
   - Work with the conversational agent
   - Define requirements
   - Test the solution
   - Save for future use

4. **Next Steps**
   - Explore more complex automations
   - Try different agent combinations
   - Save and manage workflows
   - Set up GitHub integration

## Need Help?

- See full documentation in `/docs/USER_GUIDE.md`
- Contact support at <support@monkey-one.com>
