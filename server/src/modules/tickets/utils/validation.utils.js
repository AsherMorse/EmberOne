import { formatError } from './response.utils.js';

/**
 * Validate ticket title
 * @param {string} title - Title to validate
 * @returns {boolean} True if title is valid
 */
const isValidTitle = (title) => {
  return title && title.length >= 5 && title.length <= 100;
};

/**
 * Validate ticket description
 * @param {string} description - Description to validate
 * @returns {boolean} True if description is valid
 */
const isValidDescription = (description) => {
  return description && description.length <= 2000;
};

/**
 * Validate ticket priority
 * @param {string} priority - Priority to validate
 * @returns {boolean} True if priority is valid
 */
const isValidPriority = (priority) => {
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
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
 * Validate create ticket input middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const validateCreateTicket = (req, res, next) => {
  const { title, description, priority } = req.body;
  const errors = [];

  if (!title) {
    errors.push('Title is required');
  } else if (!isValidTitle(title)) {
    errors.push('Title must be between 5 and 100 characters');
  }

  if (!description) {
    errors.push('Description is required');
  } else if (!isValidDescription(description)) {
    errors.push('Description must not exceed 2000 characters');
  }

  if (!priority) {
    errors.push('Priority is required');
  } else if (!isValidPriority(priority)) {
    errors.push('Invalid priority value');
  }

  if (errors.length > 0) {
    return res.status(400).json(
      formatError('Validation failed', 400, { errors })
    );
  }

  next();
};

/**
 * Validate update ticket input middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const validateUpdateTicket = (req, res, next) => {
  const { title, description, priority, status } = req.body;
  const errors = [];
  const role = req.user?.role;

  // Validate customer-updatable fields
  if (title && !isValidTitle(title)) {
    errors.push('Title must be between 5 and 100 characters');
  }

  if (description && !isValidDescription(description)) {
    errors.push('Description must not exceed 2000 characters');
  }

  if (priority && !isValidPriority(priority)) {
    errors.push('Invalid priority value');
  }

  // Validate agent-only fields
  if (role === 'AGENT') {
    if (status && !isValidStatus(status)) {
      errors.push('Invalid status value');
    }
  } else if (status) {
    errors.push('Only agents can update ticket status');
  }

  if (errors.length > 0) {
    return res.status(400).json(
      formatError('Validation failed', 400, { errors })
    );
  }

  next();
};

/**
 * Validate assign ticket input middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const validateAssignTicket = (req, res, next) => {
  const { agentId } = req.body;
  const errors = [];

  if (!agentId) {
    errors.push('Agent ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json(
      formatError('Validation failed', 400, { errors })
    );
  }

  next();
}; 