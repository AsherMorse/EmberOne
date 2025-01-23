/**
 * Validate comment type
 * @param {string} type - Comment type to validate
 * @returns {boolean} True if type is valid
 */
const isValidCommentType = (type) => {
  const validTypes = ['USER', 'SYSTEM', 'INTERNAL'];
  return validTypes.includes(type?.toUpperCase());
};

/**
 * Validate comment content
 * @param {string} content - Content to validate
 * @returns {boolean} True if content is valid
 */
const isValidContent = (content) => {
  return typeof content === 'string' && content.trim().length > 0;
};

/**
 * Validate comment creation input
 */
export function validateCommentCreation(req, res, next) {
  const { ticketId, content, type, isInternal } = req.body;
  const errors = [];

  // Validate ticketId
  if (!ticketId) {
    errors.push('Ticket ID is required');
  }

  // Validate content
  if (!content) {
    errors.push('Content is required');
  } else if (!isValidContent(content)) {
    errors.push('Content must be a non-empty string');
  }

  // Validate type if provided
  if (type && !isValidCommentType(type)) {
    errors.push('Invalid comment type. Must be USER, SYSTEM, or INTERNAL');
  }

  // Validate isInternal if provided
  if (isInternal !== undefined && typeof isInternal !== 'boolean') {
    errors.push('isInternal must be a boolean value');
  }

  // Return validation errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 400,
      errors
    });
  }

  next();
}

/**
 * Validate comment update input
 */
export function validateCommentUpdate(req, res, next) {
  const { content } = req.body;
  const errors = [];

  // Only content can be updated
  if (!content) {
    errors.push('Content is required');
  } else if (!isValidContent(content)) {
    errors.push('Content must be a non-empty string');
  }

  // Prevent updating other fields
  const restrictedFields = ['ticketId', 'authorId', 'type', 'isInternal'];
  const attemptedFields = restrictedFields.filter(field => req.body[field] !== undefined);
  
  if (attemptedFields.length > 0) {
    errors.push(`Cannot update the following fields: ${attemptedFields.join(', ')}`);
  }

  // Return validation errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      code: 400,
      errors
    });
  }

  next();
} 