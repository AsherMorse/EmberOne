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
  return ['CUSTOMER', 'AGENT', 'ADMIN'].includes(role?.toUpperCase());
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
      errors.role = 'Role must be either CUSTOMER, AGENT, or ADMIN';
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

/**
 * Validates UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if UUID is valid
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates ticket fields
 * @param {Object} ticket - Ticket data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object|null} Error object if invalid, null if valid
 */
const validateTicketFields = (ticket, isUpdate = false) => {
  const errors = {};
  const { title, description, priority, status } = ticket;

  // Only validate provided fields during update
  if (!isUpdate || title !== undefined) {
    if (!title?.trim()) errors.title = 'Title is required';
    else if (title.length > 200) errors.title = 'Title must be less than 200 characters';
  }

  if (!isUpdate || description !== undefined) {
    if (!description?.trim()) errors.description = 'Description is required';
    else if (description.length > 2000) errors.description = 'Description must be less than 2000 characters';
  }

  if (priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    errors.priority = 'Priority must be LOW, MEDIUM, HIGH, or CRITICAL';
  }

  if (status && !['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'].includes(status)) {
    errors.status = 'Status must be OPEN, IN_PROGRESS, WAITING, or CLOSED';
  }

  return Object.keys(errors).length ? errors : null;
};

/**
 * Validates UUID parameter
 */
export const validateUUIDParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!isValidUUID(id)) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: {
        id: 'Invalid UUID format'
      }
    });
  }

  next();
};

/**
 * Validates ticket creation/update request body
 */
export const validateTicketInput = (req, res, next) => {
  const errors = validateTicketFields(req.body, req.method === 'PUT');
  
  if (errors) {
    return res.status(400).json({
      message: 'Invalid input',
      errors,
    });
  }

  next();
};

/**
 * Internal validation for ticket list query parameters
 * @param {Object} query - Query parameters to validate
 * @returns {Object|null} Error object if invalid, null if valid
 */
const validateListQueryParams = (query) => {
  const errors = {};
  const {
    page,
    limit,
    status,
    priority,
    sort,
    order
  } = query;

  // Validate pagination
  if (page && (!Number.isInteger(+page) || +page < 1)) {
    errors.page = 'Page must be a positive integer';
  }
  if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > 100)) {
    errors.limit = 'Limit must be between 1 and 100';
  }

  // Validate status
  if (status && !['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'].includes(status)) {
    errors.status = 'Invalid status value';
  }

  // Validate priority
  if (priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    errors.priority = 'Invalid priority value';
  }

  // Validate sorting
  if (sort && !['createdAt', 'updatedAt', 'priority', 'status'].includes(sort)) {
    errors.sort = 'Invalid sort field';
  }
  if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
    errors.order = 'Order must be asc or desc';
  }

  return Object.keys(errors).length ? errors : null;
};

/**
 * Validates ticket list query parameters
 */
export const validateTicketListQuery = (req, res, next) => {
  const errors = validateListQueryParams(req.query);
  
  if (errors) {
    return res.status(400).json({
      message: 'Invalid query parameters',
      errors,
    });
  }

  next();
};
