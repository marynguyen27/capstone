const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER || 'capstone_o7rj_user',
  host: process.env.DB_HOST || 'dpg-csg4nlbqf0us73e7coc0-a',
  database: process.env.DB_NAME || 'capstone_o7rj',
  password: process.env.DB_PASSWORD || 'VRmRkynUmkQPbqYncJNDkp6cbZFyvGp3',
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
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
