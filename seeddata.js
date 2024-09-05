require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function seedData() {
  try {
    await client.connect();
    console.log('Connected to the database');

    // Clear existing data
    await client.query(
      'TRUNCATE TABLE comments, reviews, items, users RESTART IDENTITY CASCADE;'
    );

    console.log('Seeding Users...');
    const users = Array.from({ length: 200 }, (_, i) => ({
      email: `user${i + 1}@example.com`,
    }));
    for (const user of users) {
      await client.query('INSERT INTO users (email) VALUES ($1)', [user.email]);
    }
    console.log('200 users inserted successfully');

    // Seed Items
    console.log('Seeding Items...');
    const items = Array.from({ length: 200 }, (_, i) => ({
      name: `Item ${i + 1}`,
    }));
    for (const item of items) {
      await client.query('INSERT INTO items (name) VALUES ($1)', [item.name]);
    }
    console.log('200 items inserted successfully');

    // Seed Reviews
    console.log('Seeding Reviews...');
    const reviews = Array.from({ length: 200 }, (_, i) => ({
      text: `Review text ${i + 1}`,
      rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
      user_id: Math.floor(Math.random() * 200) + 1, // Random user_id between 1 and 200
      item_id: Math.floor(Math.random() * 200) + 1, // Random item_id between 1 and 200
    }));
    for (const review of reviews) {
      await client.query(
        'INSERT INTO reviews (text, rating, user_id, item_id) VALUES ($1, $2, $3, $4)',
        [review.text, review.rating, review.user_id, review.item_id]
      );
    }
    console.log('200 reviews inserted successfully');

    // Seed Comments
    console.log('Seeding Comments...');
    const comments = Array.from({ length: 200 }, (_, i) => ({
      text: `Comment text ${i + 1}`,
      review_id: Math.floor(Math.random() * 200) + 1, // Random review_id between 1 and 200
      user_id: Math.floor(Math.random() * 200) + 1, // Random user_id between 1 and 200
    }));
    for (const comment of comments) {
      await client.query(
        'INSERT INTO comments (text, review_id, user_id) VALUES ($1, $2, $3)',
        [comment.text, comment.review_id, comment.user_id]
      );
    }
    console.log('200 comments inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

seedData();
