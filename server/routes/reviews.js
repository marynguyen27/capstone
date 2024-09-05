const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const { checkAuth } = require('../middleware/auth');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'block37',
  password: '12345677',
  port: 5432,
});

client.connect().catch((err) => {
  console.error('Error connecting to the database', err);
});

router.post('/', checkAuth, async (req, res) => {
  const { itemId, rating, text } = req.body;
  const userId = req.user.id;
  try {
    const existingReview = await client.query(
      'SELECT * FROM reviews WHERE item_id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        error: 'You have already reviewed this item! One review per item!',
      });
    }

    const result = await client.query(
      'INSERT INTO reviews (item_id, user_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [itemId, userId, rating, text]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create review', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.get('/item/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await client.query(
      'SELECT reviews.*, users.name FROM reviews JOIN users ON reviews.user_id = users.id WHERE item_id = $1',
      [parseInt(itemId, 10)]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews', error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

router.get('/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  try {
    const result = await client.query(
      'SELECT reviews.*, users.name FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.id = $1',
      [parseInt(reviewId, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch the review', error);
    res.status(500).json({ error: 'Failed to fetch the review' });
  }
});

router.put('/:reviewId', checkAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { rating, text } = req.body;
  const userId = req.user.id;
  try {
    const reviewResult = await client.query(
      'SELECT * FROM reviews WHERE id = $1',
      [parseInt(reviewId, 10)]
    );

    if (
      reviewResult.rows.length === 0 ||
      reviewResult.rows[0].user_id !== userId
    ) {
      return res
        .status(404)
        .json({ error: 'Review not found or unauthorized' });
    }

    const result = await client.query(
      'UPDATE reviews SET rating = $1, text = $2 WHERE id = $3 RETURNING *',
      [rating, text, parseInt(reviewId, 10)]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update review', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.delete('/:reviewId', checkAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  try {
    const reviewResult = await client.query(
      'SELECT * FROM reviews WHERE id = $1',
      [parseInt(reviewId, 10)]
    );

    if (
      reviewResult.rows.length === 0 ||
      reviewResult.rows[0].user_id !== userId
    ) {
      return res.status(404).json({ error: 'Review not found or not allowed' });
    }

    await client.query('DELETE FROM reviews WHERE id = $1', [
      parseInt(reviewId, 10),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete review', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
