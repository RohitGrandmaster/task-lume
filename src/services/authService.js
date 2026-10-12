import APP_CONFIG from '../constants/appConfig';
import {getItem, setItem} from '../storage/storage';
import {
  cleanMobile,
  isValidMobile,
  isValidEmail,
} from '../utils/validation';

function wait(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function normalizeMobile(mobile) {
  const digits = (mobile || '').toString().replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

function sanitizeUser(user) {
  if (!user) return null;
  const {password, ...safeUser} = user;
  return safeUser;
}

// Initial default seed account for instant testing
const DEFAULT_DEMO_USERS = [
  {
    id: 'demo-user-1',
    name: 'Rohit Kumar',
    mobile: '9876543210',
    email: '',
    password: 'password123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

async function getRegisteredUsers() {
  try {
    const users = await getItem(
      APP_CONFIG.STORAGE_KEYS.REGISTERED_USERS,
      null,
    );

    if (Array.isArray(users) && users.length > 0) {
      return users;
    }

    // Seed default demo account
    await setItem(
      APP_CONFIG.STORAGE_KEYS.REGISTERED_USERS,
      DEFAULT_DEMO_USERS,
    );
    return DEFAULT_DEMO_USERS;
  } catch {
    return DEFAULT_DEMO_USERS;
  }
}

async function saveRegisteredUsers(users) {
  try {
    await setItem(
      APP_CONFIG.STORAGE_KEYS.REGISTERED_USERS,
      users,
    );
  } catch (err) {
    console.error('Failed to save registered users:', err);
  }
}

async function loginUser(mobile, password) {
  await wait(500);

  const cleanNum = cleanMobile(mobile);
  const normalized = normalizeMobile(cleanNum);

  if (!normalized || !isValidMobile(cleanNum)) {
    return {
      success: false,
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters.',
    };
  }

  const users = await getRegisteredUsers();
  const existingUser = users.find(
    u => normalizeMobile(u.mobile) === normalized,
  );

  if (!existingUser) {
    return {
      success: false,
      message:
        'No account found with this mobile number. Please sign up first.',
    };
  }

  if (existingUser.password !== password) {
    return {
      success: false,
      message: 'Incorrect password. Please try again.',
    };
  }

  return {
    success: true,
    user: sanitizeUser(existingUser),
  };
}

async function signupUser(name, mobile, password) {
  await wait(500);

  if (!name || !name.trim()) {
    return {
      success: false,
      message: 'Name is required.',
    };
  }

  const cleanNum = cleanMobile(mobile);
  const normalized = normalizeMobile(cleanNum);

  if (!normalized || !isValidMobile(cleanNum)) {
    return {
      success: false,
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters.',
    };
  }

  const users = await getRegisteredUsers();
  const existingUser = users.find(
    u => normalizeMobile(u.mobile) === normalized,
  );

  if (existingUser) {
    return {
      success: false,
      message:
        'An account with this mobile number already exists. Please log in.',
    };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    mobile: normalized,
    email: '',
    password: password,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  await saveRegisteredUsers(updatedUsers);

  return {
    success: true,
    user: sanitizeUser(newUser),
  };
}

async function updateUserInDb(userId, updates) {
  try {
    const users = await getRegisteredUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updates,
      };
      await saveRegisteredUsers(users);
      return users[index];
    }
  } catch (err) {
    console.error('Failed to update user in db:', err);
  }
  return null;
}

async function resetPassword(identifier, newPassword = 'password123') {
  await wait(500);

  const trimmed = (identifier || '').trim();
  const normalized = normalizeMobile(trimmed);
  const isEmail = isValidEmail(trimmed);

  const users = await getRegisteredUsers();
  const user = users.find(u => {
    if (isEmail && u.email && u.email.toLowerCase() === trimmed.toLowerCase()) {
      return true;
    }
    return normalizeMobile(u.mobile) === normalized;
  });

  if (!user) {
    return {
      success: false,
      message:
        'No account found with this mobile or email. Please check and try again.',
    };
  }

  user.password = newPassword;
  await saveRegisteredUsers(users);

  return {
    success: true,
    message: `Password reset successfully! Your temporary password is "${newPassword}".`,
  };
}

export {
  loginUser,
  signupUser,
  updateUserInDb,
  resetPassword,
  getRegisteredUsers,
  normalizeMobile,
};