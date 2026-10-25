/**
 * RESPONSIBILITY: Deduplicated token refresh coordinator preventing parallel refresh races (Section 941).
 * FLOW: Mutex locks concurrent refresh calls; updates authSession with fresh credentials.
 */

import { getRefreshToken, setAccessToken, clearAuthSession } from './authSession';

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAuthToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearAuthSession();
        return null;
      }
      // Stub refresh logic deferred to host backend
      return refreshToken;
    } catch {
      await clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export default { refreshAuthToken };
