/**
 * RESPONSIBILITY: Central Hardware-Backed Secure Storage Adapter (iOS Keychain / Android Keystore).
 * FLOW: Called for storing, retrieving, and clearing sensitive credentials, PINs, and auth tokens.
 */

import * as Keychain from 'react-native-keychain';

export interface SecureStorageResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Saves a secret or credential safely to hardware-backed secure storage.
 * @param key - Identifier / service name
 * @param value - Secret string value to store
 */
export async function saveSecureItem(key: string, value: string): Promise<boolean> {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error saving key "${key}":`, error);
    return false;
  }
}

/**
 * Retrieves a secret from hardware-backed secure storage.
 * @param key - Identifier / service name
 * @returns Secret string or null if not found
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`[SecureStorage] Error retrieving key "${key}":`, error);
    return null;
  }
}

/**
 * Removes a secret from hardware-backed secure storage.
 * @param key - Identifier / service name
 */
export async function deleteSecureItem(key: string): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword({ service: key });
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error deleting key "${key}":`, error);
    return false;
  }
}

export const getSecureToken = getSecureItem;
export const setSecureToken = saveSecureItem;
export const removeSecureToken = deleteSecureItem;
