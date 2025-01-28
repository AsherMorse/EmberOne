import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for testing
    message: 'Too many requests from this IP, please try again later.'
});

// Security middleware configuration
export const securityMiddleware = [
    // Basic security headers with development-friendly config
    helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : undefined,
        crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? false : undefined,
        crossOriginResourcePolicy: process.env.NODE_ENV === 'development' ? false : undefined,
        crossOriginOpenerPolicy: process.env.NODE_ENV === 'development' ? false : undefined,
    }),
    
    // Rate limiting
    limiter
]; 