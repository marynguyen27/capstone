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
  const { name, description, category } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO items (name, description, category) VALUES ($1, $2, $3) RETURNING *',
      [name, description, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create item', error);
    res.status(500).json({ error: 'Error create item' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM items');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetch items', error);
    res.status(500).json({ error: 'Error fetch items' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM items WHERE id = $1', [
      parseInt(id, 10),
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching item', error);
    res.status(500).json({ error: 'Error fetching item' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;
  try {
    const result = await client.query(
      'UPDATE items SET name = $1, description = $2, category = $3 WHERE id = $4 RETURNING *',
      [name, description, category, parseInt(id, 10)]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Item not found!' });
    }
  } catch (error) {
    console.error('Failed to update item', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM items WHERE id = $1', [
      parseInt(id, 10),
    ]);
    if (result.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Item not found!' });
    }
  } catch (error) {
    console.error('Failed to delete item', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
