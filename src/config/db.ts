import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in environment variables');
  throw new Error('DATABASE_URL is required for database connections');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Optional: Test connection on module load (commented out to avoid blocking)
// pool.query('SELECT NOW()')
//   .then(() => console.log('Database connection successful'))
//   .catch((err) => {
//     console.error('Database connection failed:', err);
//     process.exit(1);
//   });

export const db = {
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
};
