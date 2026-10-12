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

function validateProfile(name, mobile, email) {
  if (!name || !name.trim()) {
    return 'Name is required.';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }

  if (mobile && mobile.trim() && !isValidMobile(mobile.trim())) {
    return 'Please enter a valid 10-digit mobile number.';
  }

  if (email && email.trim() && !isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export {
  cleanMobile,
  isValidMobile,
  isValidEmail,
  validateProfile,
};