/**
 * RESPONSIBILITY: Canonical hardware-backed auth session state manager (Rule 18, Section 940).
 * FLOW: Stores/retrieves access and refresh tokens from iOS Keychain / Android Keystore via secureStorage.
 */

import { getSecureToken, setSecureToken, removeSecureToken } from '../storage/secureStorage';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return getSecureToken(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<boolean> {
  return setSecureToken(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecureToken(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<boolean> {
  return setSecureToken(REFRESH_TOKEN_KEY, token);
}

export async function clearAuthSession(): Promise<void> {
  await removeSecureToken(ACCESS_TOKEN_KEY);
  await removeSecureToken(REFRESH_TOKEN_KEY);
}

export default {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthSession,
};
