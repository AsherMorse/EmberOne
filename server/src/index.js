/**
 * index.js - Express Server Entry Point
 * 
 * This is the main entry point for the Express server application.
 * It handles server initialization, error handling, and port binding.
 * 
 * Environment Variables:
 * - PORT: Server port number (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 */

import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';

// Load environment variables
dotenv.config();

// Set up port configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('port', PORT);
app.set('env', NODE_ENV);

// Create and configure HTTP server
const server = http.createServer(app);

// Start listening for requests
server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Error event handler for HTTP server
 * Handles specific listen errors with custom messages
 * 
 * @param {Error} error - The error object from the server
 * @throws {Error} For unhandled error types
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Success event handler for HTTP server
 * Logs when server starts listening successfully
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  
  console.log(`
    Server Details:
    - Environment: ${NODE_ENV}
    - Listening on: ${bind}
    - Time: ${new Date().toISOString()}
  `);
} 