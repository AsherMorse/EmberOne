import { supabase } from '../config/supabase.js';

/**
 * Middleware to validate session and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get session from request header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user to request for use in protected routes
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = req.user.user_metadata?.role || 'customer';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}; 