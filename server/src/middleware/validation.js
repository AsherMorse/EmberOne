/**
 * Validation middleware for auth routes
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates role value
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
const isValidRole = (role) => {
  return ['CUSTOMER', 'AGENT'].includes(role?.toUpperCase());
};
/**
 * Validates signup/signin request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 * @param {Function} next - Next middleware function
 */
export const validateAuthInput = (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if required fields are present
  if (!email || !password) {
    return res.status(400).json({
      message: 'Missing required fields',
      errors: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null,
      },
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: {
        email: 'Invalid email format',
      },
    });
  }

  // For signup, validate password strength and role
  if (req.path === '/signup') {
    const errors = {};

    if (!isValidPassword(password)) {
      errors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (role && !isValidRole(role)) {
      errors.role = 'Role must be either CUSTOMER or AGENT';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Invalid input',
        errors,
      });
    }
  }

  next();
}; 