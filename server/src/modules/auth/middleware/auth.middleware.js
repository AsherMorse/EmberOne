import { supabase } from '../../../config/supabase.js';

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
      return res.status(401).json({
        message: 'Missing or invalid authorization header',
        code: 401
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Create a new Supabase client with the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        message: 'Invalid or expired session',
        code: 401
      });
    }

    // Attach user to request for use in protected routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      message: 'Authentication failed',
      code: 401,
      details: error.message
    });
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
      return res.status(401).json({
        message: 'User not authenticated',
        code: 401
      });
    }

    const userRole = (req.user.user_metadata?.role || 'CUSTOMER').toUpperCase();
    const normalizedRoles = roles.map(role => role.toUpperCase());
    
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        code: 403,
        details: {
          required: normalizedRoles,
          current: userRole
        }
      });
    }

    next();
  };
};
