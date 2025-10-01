#!/usr/bin/env node

/**
 * OAuth Setup Helper Script
 * 
 * This script helps generate the correct OAuth redirect URIs and origins
 * for your current development environment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectEnvironment() {
  const env = {
    type: 'unknown',
    baseUrl: 'http://localhost:4000',
    isProduction: false,
    isGitpod: false,
    isCodespaces: false,
  };

  // Check for Gitpod
  if (process.env.GITPOD_WORKSPACE_URL) {
    env.type = 'gitpod';
    env.isGitpod = true;
    env.baseUrl = process.env.GITPOD_WORKSPACE_URL.replace('https://', 'https://4000-');
  }
  
  // Check for GitHub Codespaces
  else if (process.env.CODESPACE_NAME) {
    env.type = 'codespaces';
    env.isCodespaces = true;
    env.baseUrl = `https://${process.env.CODESPACE_NAME}-4000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  
  // Check for Vercel production
  else if (process.env.VERCEL_URL) {
    env.type = 'vercel';
    env.isProduction = true;
    env.baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  
  // Default to localhost
  else {
    env.type = 'localhost';
    env.baseUrl = 'http://localhost:4000';
  }

  return env;
}

function generateOAuthConfig() {
  const env = detectEnvironment();
  const productionUrl = process.env.VITE_PUBLIC_URL || 'https://monkey-one.dev';
  const vercelUrl = 'https://monkey-one-nine.vercel.app';

  const config = {
    environment: env,
    authorizedOrigins: [
      // Production domains
      productionUrl,
      vercelUrl,
      // Development
      'http://localhost:4000',
      'http://localhost:3000',
    ],
    redirectUris: [
      // Production domains
      `${productionUrl}/auth/callback`,
      `${vercelUrl}/auth/callback`,
      // Development
      'http://localhost:4000/auth/callback',
      'http://localhost:3000/auth/callback',
    ],
  };

  // Add environment-specific URLs
  if (env.isGitpod) {
    config.authorizedOrigins.push(env.baseUrl);
    config.redirectUris.push(`${env.baseUrl}/auth/callback`);
  } else if (env.isCodespaces) {
    config.authorizedOrigins.push(env.baseUrl);
    config.redirectUris.push(`${env.baseUrl}/auth/callback`);
  }

  return config;
}

function displayConfig() {
  const config = generateOAuthConfig();
  
  console.log('\n🔧 OAuth Configuration Helper\n');
  console.log(`Environment: ${config.environment.type}`);
  console.log(`Current URL: ${config.environment.baseUrl}\n`);
  
  console.log('📋 Copy these settings to your Google OAuth Client:\n');
  
  console.log('✅ Authorized JavaScript Origins:');
  config.authorizedOrigins.forEach(origin => {
    console.log(`   ${origin}`);
  });
  
  console.log('\n✅ Authorized Redirect URIs:');
  config.redirectUris.forEach(uri => {
    console.log(`   ${uri}`);
  });
  
  console.log('\n📝 OAuth Consent Screen Settings:');
  console.log('   App Name: Monkey-One');
  console.log('   User Support Email: [Your Email]');
  console.log('   Developer Contact: [Your Email]');
  console.log('   App Domain: https://monkey-one.dev');
  console.log('   Authorized Domains:');
  console.log('     - monkey-one.dev');
  console.log('     - vercel.app');
  
  if (config.environment.isGitpod) {
    console.log('     - gitpod.io');
  } else if (config.environment.isCodespaces) {
    console.log('     - github.dev');
  }
  
  console.log('\n🔑 Required OAuth Scopes:');
  console.log('   - openid');
  console.log('   - email');
  console.log('   - profile');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Go to Google Cloud Console > APIs & Services > Credentials');
  console.log('2. Create or edit your OAuth 2.0 Client ID');
  console.log('3. Add the origins and redirect URIs listed above');
  console.log('4. Copy your Client ID and update the .env file');
  console.log('5. Run: pnpm run dev to test locally\n');
}

function updateEnvExample() {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if VITE_GOOGLE_CLIENT_ID is already set with a real value
    const clientIdMatch = envContent.match(/VITE_GOOGLE_CLIENT_ID="([^"]+)"/);
    
    if (!clientIdMatch || clientIdMatch[1] === 'your-google-client-id-here.apps.googleusercontent.com') {
      console.log('\n⚠️  Google Client ID not configured yet.');
      console.log('After creating your OAuth client, update .env with:');
      console.log('VITE_GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"');
    } else {
      console.log('\n✅ Google Client ID is configured in .env');
    }
  } catch (error) {
    console.log('\n⚠️  Could not read .env file');
  }
}

function main() {
  displayConfig();
  updateEnvExample();
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectEnvironment, generateOAuthConfig };