import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getItem,
  setItem,
} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';

const DEFAULT_PROFILE = {
  name: 'Rohit Kumar',
  mobile: '9876543210',
  email: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const AuthContext = createContext(null);

function AuthProvider({children}) {
  const [user, setUser] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const savedUser = await getItem(
          APP_CONFIG.STORAGE_KEYS.AUTH_USER,
          null,
        );

        if (savedUser && typeof savedUser === 'object') {
          setUser(savedUser);
        } else {
          setUser(DEFAULT_PROFILE);
        }
      } catch (err) {
        console.warn('[Profile] Error loading profile from storage:', err);
        setUser(DEFAULT_PROFILE);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const updateProfile = useCallback(
    async (name, mobile, email) => {
      const updatedUser = {
        ...user,
        name: typeof name === 'string' ? name.trim() : (user?.name || ''),
        mobile: typeof mobile === 'string' ? mobile.trim() : (user?.mobile || ''),
        email: typeof email === 'string' ? email.trim() : (user?.email || ''),
      };

      setUser(updatedUser);

      await setItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_USER,
        updatedUser,
      );

      return updatedUser;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      updateProfile,
    }),
    [user, loading, updateProfile],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used inside AuthProvider.',
    );
  }

  return context;
}

export {
  AuthProvider,
  useAuthContext,
};