const express = require('express');
const { connectDB, client } = require('./db');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/test', (req, res) => {
  res.send('Test route is working');
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [
      req.user.id,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      delete user.password; // Remove password from response
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Users
app.post('/users/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Unable to create user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'jwtsecret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/users', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create user' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: 'No users found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Items
app.post('/items', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create item' });
  }
});

app.get('/items', async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await client.query('SELECT * FROM items WHERE name ILIKE $1', [
        `%${search}%`,
      ]);
    } else {
      result = await client.query('SELECT * FROM items');
    }

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: 'No items found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM items WHERE id = $1', [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Reviews
app.post('/reviews', async (req, res) => {
  const { text, rating, userId, itemId } = req.body;
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const result = await client.query(
      'INSERT INTO reviews (text, rating, user_id, item_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [text, rating, userId, itemId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create review' });
  }
});

app.get('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM reviews WHERE id = $1', [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/reviews/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM reviews WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: 'No reviews found for this user' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/items/:item_id/reviews', async (req, res) => {
  const { item_id } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM reviews WHERE item_id = $1',
      [item_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.put('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { text, rating } = req.body;
  try {
    const result = await client.query(
      'UPDATE reviews SET text = $1, rating = $2 WHERE id = $3 RETURNING *',
      [text, rating, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    console.error('Database query failed:', error); // Log error to console
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Comments
app.post('/comments', async (req, res) => {
  const { text, reviewId, userId } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO comments (text, review_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [text, reviewId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Unable to create comment' });
  }
});

app.get('/comments/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM comments WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: 'No comments found for this user' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM comments WHERE id = $1', [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.put('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const result = await client.query(
      'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *',
      [text, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Comment deleted successfully' });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (error) {
    console.error('Database query failed:', error); // Log error to console
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
