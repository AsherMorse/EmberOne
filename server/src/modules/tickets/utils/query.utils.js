import { desc, asc, eq, and, isNull } from 'drizzle-orm';

/**
 * Calculate pagination parameters
 * @param {Object} options Pagination options
 * @param {number} options.page Page number
 * @param {number} options.limit Items per page
 * @param {number} totalItems Total number of items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMetadata = (options, totalItems) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  return {
    pagination: {
      page,
      limit,
      offset,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page * limit < totalItems,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get sort parameters for query
 * @param {Object} options Sort options
 * @param {string} options.sort Sort field
 * @param {string} options.order Sort order
 * @param {Object} model Database model/schema
 * @returns {Function} Sort function for query
 */
export const getSortParams = (options, model) => {
  const sort = options.sort || 'createdAt';
  const order = options.order || 'desc';
  
  const sortField = model[sort] || model.createdAt;
  const sortOrder = order === 'asc' ? asc : desc;
  
  return sortOrder(sortField);
};

/**
 * Build filter conditions for tickets
 * @param {Object} options Filter options
 * @param {string} options.status Filter by status
 * @param {string} options.priority Filter by priority
 * @param {string} options.customerId Filter by customer
 * @param {string} options.assignedAgentId Filter by assigned agent
 * @param {boolean} options.assigned Filter by assignment status
 * @param {Object} model Database model/schema
 * @returns {Object} Query conditions
 */
export const buildFilterConditions = (options, model) => {
  const conditions = [];

  const {
    status,
    priority,
    customerId,
    assignedAgentId,
    assigned
  } = options;

  if (status) conditions.push(eq(model.status, status));
  if (priority) conditions.push(eq(model.priority, priority));
  if (customerId) conditions.push(eq(model.customerId, customerId));
  if (assignedAgentId) conditions.push(eq(model.assignedAgentId, assignedAgentId));
  if (assigned === true) conditions.push(isNull(model.assignedAgentId).not());
  if (assigned === false) conditions.push(isNull(model.assignedAgentId));

  return conditions.length > 0 ? and(...conditions) : undefined;
};

/**
 * Build complete query parameters
 * @param {Object} options Query options
 * @param {Object} model Database model/schema
 * @returns {Object} Query parameters including pagination, sorting, and filtering
 */
export const buildQueryParams = (options, model) => {
  const filterConditions = buildFilterConditions(options, model);
  const sortParams = getSortParams(options, model);
  const { pagination } = getPaginationMetadata(options, 0); // Initial pagination without total

  return {
    where: filterConditions,
    orderBy: sortParams,
    limit: pagination.limit,
    offset: pagination.offset
  };
}; 