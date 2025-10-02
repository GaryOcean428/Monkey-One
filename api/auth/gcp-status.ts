import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'node:buffer';
import { verifyGCPCredentials } from '../../src/lib/auth/gcp-credentials-setup';
import { getGCPCredentials } from '../../src/lib/auth/oidc-gcp';

/**
 * API endpoint to check GCP authentication status
 * GET /api/auth/gcp-status
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we're in the right environment
    const isVercel = !!process.env.VERCEL;
    const hasOIDCToken = !!process.env.VERCEL_OIDC_TOKEN;

    // Verify credentials configuration
    const verification = verifyGCPCredentials();

    // Try to get GCP credentials
    let gcpCredentials = null;
    let gcpError = null;

    if (verification.configured) {
      try {
        gcpCredentials = await getGCPCredentials();
      } catch (error) {
        gcpError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Decode OIDC token to show subject (for debugging)
    let oidcTokenInfo = null;
    if (hasOIDCToken && process.env.VERCEL_OIDC_TOKEN) {
      try {
        const token = process.env.VERCEL_OIDC_TOKEN;
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf-8')
          );
          oidcTokenInfo = {
            subject: payload.sub,
            issuer: payload.iss,
            audience: payload.aud,
            expires: new Date(payload.exp * 1000).toISOString(),
            teamSlug: payload.team_slug,
            deploymentId: payload.deployment_id,
            projectId: payload.project_id,
          };
        }
      } catch (error) {
        console.error('Failed to decode OIDC token:', error);
      }
    }

    return res.status(200).json({
      status: 'ok',
      environment: {
        isVercel,
        hasOIDCToken,
        nodeVersion: process.version,
      },
      credentials: {
        configured: verification.configured,
        tokenAvailable: verification.tokenAvailable,
        credentialsPath: verification.credentialsPath,
        message: verification.message,
      },
      oidcToken: oidcTokenInfo ? {
        subject: oidcTokenInfo.subject,
        issuer: oidcTokenInfo.issuer,
        teamSlug: oidcTokenInfo.teamSlug,
        deploymentId: oidcTokenInfo.deploymentId,
        expiresAt: oidcTokenInfo.expires,
      } : null,
      gcpAuthentication: {
        success: !!gcpCredentials,
        error: gcpError,
        hasAccessToken: !!gcpCredentials?.accessToken,
        tokenExpiresAt: gcpCredentials?.expiresAt,
      },
      gcpConfig: {
        projectId: process.env.GCP_PROJECT_ID,
        projectNumber: process.env.GCP_PROJECT_NUMBER,
        serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
        workloadIdentityPoolId: process.env.GCP_WORKLOAD_IDENTITY_POOL_ID,
        workloadIdentityProviderId: process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GCP status check error:', error);
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
