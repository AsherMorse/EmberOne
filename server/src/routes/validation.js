import { z } from 'zod';

/**
 * Validate ticket input data
 */
export const validateTicketInput = (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
      assignedAgentId: z.string().uuid().optional().nullable()
    });

    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    next(error);
  }
};

/**
 * Validate UUID parameter
 */
export const validateUUIDParam = (req, res, next) => {
  try {
    const schema = z.string().uuid();
    schema.parse(req.params.id);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid ID format',
      details: 'ID must be a valid UUID'
    });
  }
};

/**
 * Validate ticket list query parameters
 */
export const validateTicketListQuery = (req, res, next) => {
  try {
    const schema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      sort: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).optional(),
      order: z.enum(['asc', 'desc']).optional(),
      assigned: z.enum(['true', 'false']).optional()
    });

    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors
      });
    }
    next(error);
  }
}; 