/**
 * Validate ticket priority
 * @param {string} priority - Priority to validate
 * @returns {boolean} True if priority is valid
 */
const isValidPriority = (priority) => {
  const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  return validPriorities.includes(priority?.toUpperCase());
};

/**
 * Validate ticket status
 * @param {string} status - Status to validate
 * @returns {boolean} True if status is valid
 */
const isValidStatus = (status) => {
  const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'];
  return validStatuses.includes(status?.toUpperCase());
};

/**
 * Validate ticket creation input
 */
export const validateTicketCreation = (req, res, next) => {
  const { title, description, priority } = req.body;
  const errors = [];

  if (!title?.trim()) {
    errors.push('Title is required');
  }

  if (!description?.trim()) {
    errors.push('Description is required');
  }

  if (!priority) {
    errors.push('Priority is required');
  } else if (!isValidPriority(priority)) {
    errors.push('Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL');
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
 * Validate ticket update input based on user role
 */
export const validateTicketUpdate = (req, res, next) => {
  const errors = [];
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';

  if (role === 'CUSTOMER') {
    const { title, description, priority } = req.body;
    
    if (title !== undefined && !title.trim()) {
      errors.push('Title cannot be empty');
    }
    
    if (description !== undefined && !description.trim()) {
      errors.push('Description cannot be empty');
    }
    
    if (priority !== undefined && !isValidPriority(priority)) {
      errors.push('Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL');
    }

    // Prevent customers from updating status
    if (req.body.status !== undefined) {
      errors.push('Customers cannot update ticket status');
    }
  } else if (role === 'AGENT') {
    const { status } = req.body;
    
    if (!status) {
      errors.push('Status is required');
    } else if (!isValidStatus(status)) {
      errors.push('Invalid status. Must be OPEN, IN_PROGRESS, WAITING, or CLOSED');
    }

    // Prevent agents from updating other fields
    const restrictedFields = ['title', 'description', 'priority'];
    const attemptedFields = restrictedFields.filter(field => req.body[field] !== undefined);
    
    if (attemptedFields.length > 0) {
      errors.push(`Agents can only update status. Cannot update: ${attemptedFields.join(', ')}`);
    }
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
 * Validate ticket assignment input
 */
export const validateTicketAssignment = (req, res, next) => {
  const { agentId } = req.body;
  const errors = [];

  if (!agentId) {
    errors.push('Agent ID is required');
  }

  // Ensure only agents can assign tickets
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  if (role !== 'AGENT') {
    errors.push('Only agents can assign tickets');
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
 * Validate query parameters for listing tickets
 */
export const validateListQuery = (req, res, next) => {
  const errors = [];
  const { page, limit, sortBy, sortOrder, status, priority, search } = req.query;

  // Validate pagination
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }

  // Validate sorting
  const validSortFields = ['createdAt', 'updatedAt', 'status', 'priority', 'title'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    errors.push(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
  }

  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    errors.push('Sort order must be either "asc" or "desc"');
  }

  // Validate filters
  if (status && !isValidStatus(status)) {
    errors.push('Invalid status filter');
  }

  if (priority && !isValidPriority(priority)) {
    errors.push('Invalid priority filter');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Invalid query parameters',
      code: 400,
      errors
    });
  }

  next();
};