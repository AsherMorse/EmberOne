/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password requirements
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate role
 */
const isValidRole = (role) => {
  const validRoles = ['CUSTOMER', 'AGENT', 'ADMIN'];
  return validRoles.includes(role?.toUpperCase());
};

/**
 * Validate signup input
 */
export const validateSignUp = (req, res, next) => {
  const { email, password, role } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (!isValidPassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !isValidRole(role)) {
    errors.push('Invalid role');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 400,
      errors
    });
  }

  next();
};

/**
 * Validate signin input
 */
export const validateSignIn = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 400,
      errors
    });
  }

  next();
};

/**
 * Validate profile update input
 */
export const validateProfileUpdate = (req, res, next) => {
  const { fullName, role } = req.body;
  const errors = [];

  if (fullName !== undefined && (!fullName || typeof fullName !== 'string' || fullName.length < 2)) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (role !== undefined && !isValidRole(role)) {
    errors.push('Invalid role');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 400,
      errors
    });
  }

  next();
}; 