import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Environment variable validation
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in environment variables`);
  }
  return value;
};

// Create the postgres client with connection pooling
const client = postgres({
  host: getEnvVar('DB_HOST'),
  port: parseInt(getEnvVar('DB_PORT')),
  database: getEnvVar('DB_NAME'),
  username: getEnvVar('DB_USER'),
  password: getEnvVar('DB_PASSWORD'),
  ssl: 'require',
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Max seconds a client can be idle before being closed
  connect_timeout: 2, // Max seconds to wait for a connection
});

// Create a Drizzle instance with the client and schema
export const db = drizzle(client, { schema });

// Helper function to check database connectivity
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};
