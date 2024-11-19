import { Pool } from 'pg';
import { Sequelize } from 'sequelize';

// Get database credentials from environment variables
const {
  VITE_PG_USER: user = 'postgres',
  VITE_PG_HOST: host = '34.116.107.32',
  VITE_PG_DATABASE: database = 'my-cloud-sdk',
  VITE_PG_PASSWORD: password,
  VITE_PG_PORT: port = '5432'
} = import.meta.env;

// Validate required credentials
if (!password) {
  throw new Error('Database password not found in environment variables');
}

// Shared database config
const dbConfig = {
  user,
  host,
  database,
  password,
  port: Number(port),
  ssl: {
    rejectUnauthorized: false // Required for Google Cloud SQL
  }
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Create Sequelize instance
export const sequelize = new Sequelize({
  dialect: 'postgres',
  username: user,
  password,
  database,
  host,
  port: Number(port),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

// Test database connection
export async function testConnection() {
  try {
    await pool.connect();
    console.log('PostgreSQL connection successful');
    
    await sequelize.authenticate();
    console.log('Sequelize connection successful');
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default {
  pool,
  sequelize,
  testConnection
};