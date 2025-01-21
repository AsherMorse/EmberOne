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
import ticketRoutes from './routes/tickets.routes.js';
import { formatError } from './modules/auth/utils/response.utils.js';

const app = express();

// Security middleware (helmet, rate limiting, etc.)
app.use(securityMiddleware);

// CORS configuration with credentials support
app.use(cors({
  origin: process.env.API_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
  res.status(404).json(
    formatError('Route not found', 404, { path: req.originalUrl })
  );
});

/**
 * Global error handler
 * Catches all unhandled errors and sends a formatted response
 * 
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
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

  res.status(statusCode).json(
    formatError(
      err.message || 'Internal server error',
      statusCode,
      errorDetails
    )
  );
});

export default app; 