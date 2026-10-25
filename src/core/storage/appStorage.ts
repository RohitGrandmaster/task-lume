/**
 * RESPONSIBILITY: Canonical non-sensitive local data storage gateway (Section 953).
 * FLOW: Persists app preferences, cached lists, and UI state through AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setAppItem<T>(key: string, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`[appStorage] Failed to set item for key "${key}":`, err);
  }
}

export async function getAppItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[appStorage] Failed to get item for key "${key}":`, err);
    return defaultValue;
  }
}

export async function removeAppItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[appStorage] Failed to remove item for key "${key}":`, err);
  }
}

export default { setAppItem, getAppItem, removeAppItem };
