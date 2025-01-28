/**
 * app.js - Express Application Configuration
 * 
 * This module sets up the Express application with all necessary middleware,
 * security configurations, and route handlers.
 * 
 * Environment Variables:
 * - API_URL: Frontend URL for CORS (default: http://localhost:5173)
 * - NODE_ENV: Environment mode (development/production)
 */

import express from 'express';
import cors from 'cors';
import { securityMiddleware } from './config/security.config.js';
import authRoutes from './modules/auth/routes.js';
import ticketRoutes from './modules/tickets/routes.js';
import commentRoutes from './modules/comments/routes.js';
import adminRoutes from './modules/admin/routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware (helmet, rate limiting, etc.)
app.use(securityMiddleware);

// Special middleware for development and test pages
app.use((req, res, next) => {
  // Disable SSL requirement for local development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Strict-Transport-Security', 'max-age=0');
  }
  
  // Allow test page to load resources over HTTP
  if (req.path.includes('/test-sse.html') || req.path.includes('/js/test-sse.js')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' http: https:; script-src 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline';"
    );
  }
  next();
});

// CORS configuration with credentials support
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',  // Add localhost:3000 for test page
      'https://ember-one-client.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, origin);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);
app.use('/api/admin', adminRoutes);

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    code: 404,
    details: { path: req.originalUrl }
  });
});

/**
 * Global error handler
 * Catches all unhandled errors and sends a formatted response
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.status || 500;
  const errorDetails = process.env.NODE_ENV === 'development' 
    ? { stack: err.stack }
    : undefined;

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    code: statusCode,
    ...(errorDetails && { details: errorDetails })
  });
});

export default app; 