const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserResult = await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const newUser = newUserResult.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error Registering', error);
    res.status(500).json({ error: 'Error Registering' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Failed to login', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', checkAuth, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [
      req.user.id,
    ]);

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to fetch details', error);
    res.status(500).json({ error: 'Failed to fetch details' });
  }
});

router.put('/me', checkAuth, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    const setQuery = [];
    const queryParams = [];
    let paramIndex = 1;

    if (name) {
      setQuery.push(`name = $${paramIndex++}`);
      queryParams.push(name);
    }
    if (email) {
      setQuery.push(`email = $${paramIndex++}`);
      queryParams.push(email);
    }
    if (password) {
      setQuery.push(`password = $${paramIndex++}`);
      queryParams.push(password);
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ error: 'No update data' });
    }

    queryParams.push(req.user.id);

    const query = `UPDATE users SET ${setQuery.join(
      ', '
    )} WHERE id = $${paramIndex} RETURNING *`;
    const result = await client.query(query, queryParams);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update profile', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.delete('/me', checkAuth, async (req, res) => {
  try {
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete account', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
