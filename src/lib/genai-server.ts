/**
 * Server-only Vertex AI helpers.
 *
 * This file uses `google-auth-library` which depends on Node.js built-ins
 * (child_process, fs). It MUST NOT be imported from client components —
 * only from API routes / server components.
 */

/**
 * Get Vertex AI project config + OAuth2 access token for REST-based
 * API calls (Veo, Lyria) that don't use the Gen AI SDK.
 *
 * This is in a separate file from genai.ts because it depends on
 * `google-auth-library` which is Node.js-only (child_process, fs).
 * Keeping it isolated prevents tree-shaking from pulling Node modules
 * into the client bundle.
 */
export async function getVertexAIConfig() {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set.');
  }

  // Use Google Auth Library for Application Default Credentials
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;

  if (!accessToken) {
    throw new Error('Failed to obtain access token for Vertex AI.');
  }

  return { project, location, accessToken };
}
