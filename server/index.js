const express = require('express');
const { connectDB, client } = require('./db');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/test', (req, res) => {
  res.send('Test route is working');
});

app.options('*', cors());

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret', (err, user) => {
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
      delete user.password;
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
      { expiresIn: '1000d' }
    );

    res.status(200).json({ token, userId: user.id });
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

app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { email, password } = req.body;
  const fieldsToUpdate = [];

  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email) {
      fieldsToUpdate.push(`email = '${email}'`);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      fieldsToUpdate.push(`password = '${hashedPassword}'`);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateQuery = `
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = $1 
      RETURNING *;
    `;

    const updatedUser = await client.query(updateQuery, [userId]);

    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Server error' });
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
  if (!text || !rating || !userId || !itemId) {
    return res.status(400).json({ error: 'Missing required fields' });
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
  const { text, rating } = req.body;
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const existingReview = await client.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND item_id = $2',
      [userId, itemId]
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'You have already submitted a review for this item.' });
    }

    const result = await client.query(
      'INSERT INTO reviews (text, rating, user_id, item_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [text, rating, userId, itemId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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

app.put('/reviews/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const { text, rating } = req.body;
  const userId = req.user.id;
  try {
    const review = await client.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({
        error: 'Review not found or you are not authorized to edit it.',
      });
    }

    const result = await client.query(
      'UPDATE reviews SET text = $1, rating = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [text, rating, reviewId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

app.delete('/reviews/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const result = await client.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [reviewId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Review not found or you are not authorized to delete it.',
      });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Comments
app.post('/comments/:reviewId', authenticateToken, async (req, res) => {
  const { text } = req.body;
  const { reviewId } = req.params;
  const userId = req.user.id;
  try {
    const result = await client.query(
      'INSERT INTO comments (text, user_id, review_id) VALUES ($1, $2, $3) RETURNING *',
      [text, userId, reviewId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.get('/comments/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await client.query(
      `
      SELECT comments.id AS comment_id, comments.text AS comment_text, 
             items.name AS item_name, items.id AS item_id
      FROM comments
      JOIN reviews ON comments.review_id = reviews.id
      JOIN items ON reviews.item_id = items.id
      WHERE comments.user_id = $1
      ORDER BY comments.id DESC;
    `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No comments found for this user' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user comments with item:', error);
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
});

app.get('/comments/review/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  console.log(`Fetching comments for review ID: ${reviewId}`);

  try {
    const result = await client.query(
      'SELECT * FROM comments WHERE review_id = $1',
      [reviewId]
    );

    console.log('Comments fetched:', result.rows);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No comments found for this review' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.put('/comments/:commentId', authenticateToken, async (req, res) => {
  const { text } = req.body;
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const result = await client.query(
      'UPDATE comments SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [text, commentId, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Comment not found or not authorized to edit' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

app.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const result = await client.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: 'Comment not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
