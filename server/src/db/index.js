import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Initialize postgres.js client
const client = postgres(process.env.DATABASE_URL, { 
  prepare: false,  // Disable prepare statements as they're not supported by the pooler
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Set max connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Create Drizzle ORM instance
const db = drizzle(client, { schema });

export { db, client };
