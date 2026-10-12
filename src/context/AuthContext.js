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
  removeItem,
  setItem,
} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';

import {
  loginUser,
  signupUser,
  resetPassword as resetPasswordRequest,
  updateUserInDb,
} from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const savedUser = await getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_USER,
        null,
      );

      setUser(savedUser);
      setLoading(false);
    }

    loadSession();
  }, []);

  async function login(mobile, password) {
    const result = await loginUser(
      mobile,
      password,
    );

    if (result.success) {
      setUser(result.user);

      await setItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_USER,
        result.user,
      );
    }

    return result;
  }

  async function signup(name, mobile, password) {
    const result = await signupUser(
      name,
      mobile,
      password,
    );

    if (result.success) {
      setUser(result.user);

      await setItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_USER,
        result.user,
      );
    }

    return result;
  }

  async function resetPassword(identifier) {
    return resetPasswordRequest(identifier);
  }

  const updateProfile = useCallback(
    async (name, email) => {
      if (!user) {
        return;
      }

      const updatedUser = {
        ...user,
        name: typeof name === 'string' ? name.trim() : user.name,
        email: typeof email === 'string' ? email.trim() : (user.email || ''),
      };

      setUser(updatedUser);

      await setItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_USER,
        updatedUser,
      );

      await updateUserInDb(user.id, {
        name: updatedUser.name,
        email: updatedUser.email,
      });
    },
    [user],
  );

  async function logout() {
    setUser(null);

    await removeItem(
      APP_CONFIG.STORAGE_KEYS.AUTH_USER,
    );
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,

      login,
      signup,
      resetPassword,
      updateProfile,
      logout,
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