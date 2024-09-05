const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'block37',
  password: process.env.DB_PASSWORD || '12345677',
  port: process.env.DB_PORT || 5432,
});

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to the PostgreSQL database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}
module.exports = { client, connectDB };
