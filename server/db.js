const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'block37_user',
  host:
    process.env.DB_HOST ||
    'dpg-crqbhidsvqrc73csmf90-a.oregon-postgres.render.com',
  database: process.env.DB_NAME || 'block37',
  password: process.env.DB_PASSWORD || 'NC4LTqaFWLUbl5zuJMU9CX2HyEmmxNRX',
  port: process.env.DB_PORT || 5432,
  ssl: true,
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
