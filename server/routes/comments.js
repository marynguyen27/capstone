const express = require('express');
const router = express.Router();
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'block37',
  password: '12345677',
  port: 5432,
});

client.connect().catch((err) => {
  console.error('Error connecting to the DB', err);
});

router.post('/', async (req, res) => {
  const { text, userId, reviewId } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO comments (text, review_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [text, reviewId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create comment', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.get('/review/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM comments WHERE review_id = $1',
      [parseInt(reviewId, 10)]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching comments', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const result = await client.query(
      'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *',
      [text, parseInt(id, 10)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found!' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update comment', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM comments WHERE id = $1', [
      parseInt(id, 10),
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found!' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete comment', error);
    res.status(500).json({ error: 'Failed to delete comment!' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM comments WHERE id = $1', [
      parseInt(id, 10),
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch comment', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

module.exports = router;
