# GCP Workload Identity Federation with Vercel OIDC

Complete guide for authenticating to Google Cloud Platform using Vercel's OIDC tokens.

## Overview

This setup allows your Vercel deployments to authenticate to GCP without storing long-lived service account keys. Instead, Vercel provides short-lived OIDC tokens that are exchanged for GCP credentials through Workload Identity Federation.

## Architecture

```
Vercel Deployment → VERCEL_OIDC_TOKEN → GCP Workload Identity Pool → Service Account Impersonation → GCP APIs
```

## Prerequisites

- ✅ Vercel account with a team
- ✅ GCP project with billing enabled
- ✅ GCP Workload Identity Pool configured
- ✅ Service account with necessary permissions

## Configuration Files

### 1. GCP Credential Configuration

**File:** `tmp/clientLibraryConfig-vercel.json`

```json
{
  "universe_domain": "googleapis.com",
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/425089133667/locations/global/workloadIdentityPools/vercel/providers/vercel",
  "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_url": "https://sts.googleapis.com/v1/token",
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/vercel@agent-one-ffec8.iam.gserviceaccount.com:generateAccessToken",
  "credential_source": {
    "file": "/tmp/vercel-oidc-token.txt",
    "format": {
      "type": "text"
    }
  }
}
```

### 2. Environment Variables

**Required in `.env` and Vercel:**

```bash
# GCP Configuration
GCP_PROJECT_ID=agent-one-ffec8
GCP_PROJECT_NUMBER=425089133667
GCP_SERVICE_ACCOUNT_EMAIL=vercel@agent-one-ffec8.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_POOL_ID=vercel
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID=vercel

# OIDC Configuration
VITE_OIDC_ENABLED=true
VITE_OIDC_ISSUER_MODE=team

# Vercel automatically provides
VERCEL_OIDC_TOKEN=<auto-injected-by-vercel>
```

## GCP Console Setup

### Step 1: Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create vercel \
  --location=global \
  --display-name="Vercel OIDC Pool"
```

### Step 2: Create OIDC Provider

```bash
gcloud iam workload-identity-pools providers create-oidc vercel \
  --location=global \
  --workload-identity-pool=vercel \
  --issuer-uri="https://oidc.vercel.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.team_slug=assertion.team_slug,attribute.deployment_id=assertion.deployment_id" \
  --attribute-condition="assertion.aud=='vercel'"
```

### Step 3: Create Service Account

```bash
gcloud iam service-accounts create vercel \
  --display-name="Vercel Deployments"
```

### Step 4: Grant Service Account Permissions

```bash
# Example: Grant Cloud Storage access
gcloud projects add-iam-policy-binding agent-one-ffec8 \
  --member="serviceAccount:vercel@agent-one-ffec8.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

### Step 5: Allow Workload Identity Pool to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding \
  vercel@agent-one-ffec8.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/425089133667/locations/global/workloadIdentityPools/vercel/attribute.team_slug/*"
```

**Or for all subjects (less secure):**

```bash
gcloud iam service-accounts add-iam-policy-binding \
  vercel@agent-one-ffec8.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/425089133667/locations/global/workloadIdentityPools/vercel/subject/*"
```

## OIDC Token Path Configuration

When setting up in GCP Console, for the "OIDC token path" field:

**Enter:** `/tmp/vercel-oidc-token.txt`

**Format type:** `text`

The application code will automatically export `VERCEL_OIDC_TOKEN` to this file location.

## Code Integration

### Application Startup

The GCP credentials are automatically initialized when you import the module:

```typescript
// This happens automatically on import
import { initializeGCPCredentials } from './lib/auth/gcp-credentials-setup';
```

Or manually:

```typescript
import { setupVercelOIDCForGCP, verifyGCPCredentials } from './lib/auth/gcp-credentials-setup';

// Setup credentials
const success = setupVercelOIDCForGCP();

// Verify setup
const status = verifyGCPCredentials();
console.log(status.message);
```

### Using GCP APIs

Once configured, you can use any GCP client library normally:

```typescript
import { Storage } from '@google-cloud/storage';
import { getGCPCredentials } from './lib/auth/oidc-gcp';

// Option 1: Use client libraries directly (they auto-detect credentials)
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

// Option 2: Get credentials explicitly
const credentials = await getGCPCredentials();
if (credentials) {
  // Use credentials.accessToken for API calls
  const response = await fetch('https://storage.googleapis.com/storage/v1/b', {
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`
    }
  });
}
```

## Testing

### API Endpoint

Test your GCP authentication setup:

```bash
# Local development
curl http://localhost:3004/api/auth/gcp-status

# Production
curl https://monkey-one.dev/api/auth/gcp-status
```

**Expected response:**

```json
{
  "status": "ok",
  "environment": {
    "isVercel": true,
    "hasOIDCToken": true,
    "nodeVersion": "v20.x.x"
  },
  "credentials": {
    "configured": true,
    "tokenAvailable": true,
    "credentialsPath": "/workspaces/Monkey-One/tmp/clientLibraryConfig-vercel.json",
    "message": "GCP credentials properly configured"
  },
  "oidcToken": {
    "subject": "team:your-team-slug",
    "issuer": "https://oidc.vercel.com",
    "teamSlug": "your-team-slug",
    "deploymentId": "dpl_xxx",
    "expiresAt": "2025-01-02T12:00:00.000Z"
  },
  "gcpAuthentication": {
    "success": true,
    "error": null,
    "hasAccessToken": true,
    "tokenExpiresAt": "2025-01-02T12:00:00.000Z"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "VERCEL_OIDC_TOKEN not available"

**Cause:** OIDC token is only available in Vercel deployments, not in local development.

**Solution:**
- For local testing, you can manually set a test token
- Or use service account keys for local development only

#### 2. "Permission denied" errors

**Cause:** Service account doesn't have required permissions.

**Solution:**

```bash
# Grant necessary roles to service account
gcloud projects add-iam-policy-binding agent-one-ffec8 \
  --member="serviceAccount:vercel@agent-one-ffec8.iam.gserviceaccount.com" \
  --role="roles/REQUIRED_ROLE"
```

#### 3. "Invalid audience" or "Token exchange failed"

**Cause:** Workload Identity Pool provider configuration mismatch.

**Solution:**
- Verify issuer URI is `https://oidc.vercel.com`
- Check audience matches your Vercel team/project
- Verify attribute mappings are correct

#### 4. "Credentials file not found"

**Cause:** Credential configuration file is missing.

**Solution:**
- Ensure `tmp/clientLibraryConfig-vercel.json` exists in your project
- Deploy it with your application
- Check file paths in configuration

### Debug Mode

Enable verbose logging:

```typescript
import { setupVercelOIDCForGCP, verifyGCPCredentials } from './lib/auth/gcp-credentials-setup';

// Setup with logging
const success = setupVercelOIDCForGCP();
console.log('Setup successful:', success);

// Verify configuration
const verification = verifyGCPCredentials();
console.log('Verification:', verification);

// Check OIDC token
if (process.env.VERCEL_OIDC_TOKEN) {
  const token = process.env.VERCEL_OIDC_TOKEN;
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('OIDC Token Subject:', payload.sub);
  console.log('OIDC Token Audience:', payload.aud);
  console.log('OIDC Token Expires:', new Date(payload.exp * 1000));
}
```

## Security Best Practices

1. **Use Attribute Conditions**
   - Restrict to specific team: `assertion.team_slug == "your-team"`
   - Restrict to specific project: `assertion.project_id == "your-project"`

2. **Principle of Least Privilege**
   - Grant only necessary IAM roles to service account
   - Use resource-level permissions where possible

3. **Monitor Usage**
   - Enable Cloud Audit Logs
   - Monitor service account activity
   - Set up alerts for unusual patterns

4. **Rotate Regularly**
   - While OIDC tokens are short-lived, periodically review:
     - Workload Identity Pool configuration
     - Service account permissions
     - IAM bindings

## Related Documentation

- [Vercel OIDC Documentation](https://vercel.com/docs/oidc/gcp)
- [GCP Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [OIDC Token Claims Reference](https://vercel.com/docs/oidc/reference)

## Support

For issues specific to:
- **Vercel OIDC**: Check Vercel documentation or support
- **GCP Configuration**: Refer to Google Cloud documentation
- **This Integration**: Check `/api/auth/gcp-status` endpoint for diagnostics
