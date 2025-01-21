import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Construct connection string from environment variables
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Initialize postgres.js client
const client = postgres(connectionString, { 
  prepare: false,  // Disable prepare statements as they're not supported by the pooler
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Set max connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create Drizzle ORM instance
const db = drizzle(client, { schema });

export { db, client };
