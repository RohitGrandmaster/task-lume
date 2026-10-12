import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {AppState} from 'react-native';
import {getItem, setItem, removeItem} from '../storage/storage';
import APP_CONFIG from '../constants/appConfig';

const AppLockContext = createContext(null);

const KEY_ENABLED = '@todomaster/app_lock_enabled';
const KEY_PIN = '@todomaster/app_lock_pin';

export function AppLockProvider({children}) {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [storedPin, setStoredPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const appStateRef = useRef(AppState.currentState);

  // Load initial lock status
  useEffect(() => {
    async function loadLockConfig() {
      try {
        const enabled = await getItem(KEY_ENABLED, false);
        const pin = await getItem(KEY_PIN, null);
        if (enabled && pin) {
          setIsLockEnabled(true);
          setStoredPin(String(pin));
          setIsLocked(true); // Lock on app start
        } else {
          setIsLockEnabled(false);
          setStoredPin(null);
          setIsLocked(false);
        }
      } catch (e) {
        console.warn('Failed to load app lock config', e);
      } finally {
        setLoading(false);
      }
    }
    loadLockConfig();
  }, []);

  // Listen to AppState changes (background -> active)
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App resumed from background
        if (isLockEnabled && storedPin) {
          setIsLocked(true);
        }
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [isLockEnabled, storedPin]);

  // Unlock app with PIN
  const unlockWithPin = useCallback(
    enteredPin => {
      if (!storedPin) return true;
      if (String(enteredPin) === String(storedPin)) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [storedPin],
  );

  // Enable App Lock with new PIN
  const setupPin = useCallback(async newPin => {
    if (!newPin || newPin.length !== 4) return false;
    await setItem(KEY_ENABLED, true);
    await setItem(KEY_PIN, String(newPin));
    setIsLockEnabled(true);
    setStoredPin(String(newPin));
    setIsLocked(false);
    return true;
  }, []);

  // Disable App Lock
  const removePin = useCallback(
    async enteredPin => {
      if (String(enteredPin) !== String(storedPin)) {
        return false;
      }
      await removeItem(KEY_ENABLED);
      await removeItem(KEY_PIN);
      setIsLockEnabled(false);
      setStoredPin(null);
      setIsLocked(false);
      return true;
    },
    [storedPin],
  );

  // Manual lock
  const lockNow = useCallback(() => {
    if (isLockEnabled && storedPin) {
      setIsLocked(true);
    }
  }, [isLockEnabled, storedPin]);

  return (
    <AppLockContext.Provider
      value={{
        isLockEnabled,
        isLocked,
        storedPin,
        loading,
        unlockWithPin,
        setupPin,
        removePin,
        lockNow,
      }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
}
