/**
 * RESPONSIBILITY: Type contract for the legacy AsyncStorage adapter used by native JS modules.
 * FLOW: Feature and core services use generic getItem/setItem wrappers with explicit fallback value types.
 */

export function getItem<T = null>(key: string, fallback?: T): Promise<T>;
export function setItem(key: string, value: unknown): Promise<void>;
export function removeItem(key: string): Promise<void>;
export function clearStorage(): Promise<void>;
