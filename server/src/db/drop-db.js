import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function dropDatabase() {
  const client = postgres({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: 'require',
  });

  const db = drizzle(client);

  try {
    const sqlPath = join(__dirname, 'drop-all.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    await client.unsafe(sql);
    console.log('Successfully dropped all tables and types');
  } catch (error) {
    console.error('Error dropping database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

dropDatabase(); 