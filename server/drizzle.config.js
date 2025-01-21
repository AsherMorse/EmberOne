import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

// Validate required database configuration
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing ${envVar} in environment variables`);
  }
}

export default defineConfig({
  schema: './src/db/schema/index.js',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: 'require',
  },
});
