function cleanMobile(mobile) {
  if (!mobile) return '';
  return mobile.toString().trim().replace(/[\s\-()]/g, '');
}

function isValidMobile(mobile) {
  const cleaned = cleanMobile(mobile);
  // Accept standard 10-digit mobile number or 10-13 digits with optional country code (+91, etc.)
  const pattern = /^(\+?\d{1,3})?[0-9]{10}$/;
  return pattern.test(cleaned);
}

function isValidEmail(email) {
  if (!email) return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

function validateLogin(mobile, password) {
  if (!mobile || !mobile.trim()) {
    return 'Please enter your mobile number.';
  }

  if (!isValidMobile(mobile)) {
    return 'Please enter a valid 10-digit mobile number.';
  }

  if (!password) {
    return 'Please enter your password.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return '';
}

function validateSignup(
  name,
  mobile,
  password,
  confirmPassword,
) {
  if (!name || !name.trim()) {
    return 'Please enter your name.';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }

  if (!mobile || !mobile.trim()) {
    return 'Please enter your mobile number.';
  }

  if (!isValidMobile(mobile)) {
    return 'Please enter a valid 10-digit mobile number.';
  }

  if (!password) {
    return 'Please enter a password.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  if (!confirmPassword) {
    return 'Please confirm your password.';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return '';
}

function validateProfile(name, email) {
  if (!name || !name.trim()) {
    return 'Name is required.';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }

  if (email && email.trim() && !isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

function validateForgotPassword(identifier) {
  if (!identifier || !identifier.trim()) {
    return 'Please enter your mobile number or email.';
  }

  const trimmed = identifier.trim();
  if (!isValidMobile(trimmed) && !isValidEmail(trimmed)) {
    return 'Please enter a valid 10-digit mobile number or email.';
  }

  return '';
}

export {
  cleanMobile,
  isValidMobile,
  isValidEmail,
  validateLogin,
  validateSignup,
  validateProfile,
  validateForgotPassword,
};