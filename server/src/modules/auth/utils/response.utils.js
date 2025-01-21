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

/**
 * Format a paginated response
 * @param {Array} items - Array of items for the current page
 * @param {Object} meta - Pagination metadata
 * @param {number} meta.total - Total number of items
 * @param {number} meta.page - Current page number
 * @param {number} meta.limit - Items per page
 * @returns {Object} Formatted paginated response
 */
export const formatPaginated = (items, { total, page, limit }) => ({
  success: true,
  data: items,
  meta: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  }
}); 