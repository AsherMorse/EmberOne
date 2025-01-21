/**
 * Format a successful response
 * @param {any} data - The data to send in the response
 * @returns {Object} Formatted success response
 */
export const formatSuccess = (data) => ({
  success: true,
  data
});

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {number} code - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Object} Formatted error response
 */
export const formatError = (message, code, details = null) => ({
  success: false,
  error: {
    message,
    code,
    ...(details && { details })
  }
});