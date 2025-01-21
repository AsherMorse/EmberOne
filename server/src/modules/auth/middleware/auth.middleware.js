import { supabase } from '../../../config/supabase.js';
import { formatError } from '../utils/response.utils.js';

/**
 * Middleware to validate session and attach user to request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get session from request header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json(
        formatError('Missing or invalid authorization header', 401)
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json(
        formatError('Invalid or expired session', 401)
      );
    }

    // Attach user to request for use in protected routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json(
      formatError('Authentication failed', 401, { details: error.message })
    );
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 * @returns {import('express').RequestHandler} Express middleware function
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        formatError('User not authenticated', 401)
      );
    }

    const userRole = (req.user.user_metadata?.role || 'CUSTOMER').toUpperCase();
    const normalizedRoles = roles.map(role => role.toUpperCase());
    
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json(
        formatError('Insufficient permissions', 403, {
          required: normalizedRoles,
          current: userRole
        })
      );
    }

    next();
  };
};
