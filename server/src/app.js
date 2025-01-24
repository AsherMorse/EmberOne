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

const app = express();

// Security middleware (helmet, rate limiting, etc.)
app.use(securityMiddleware);

// CORS configuration with credentials support
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://ember-one-client.vercel.app',
      'https://emberone.ashermorse.org'
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);

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