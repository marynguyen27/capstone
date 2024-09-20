-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  user_id INT REFERENCES users(id),
  item_id INT REFERENCES items(id),
  UNIQUE (user_id, item_id)  
);

-- comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
  user_id INT REFERENCES users(id),
  review_id INT REFERENCES reviews(id)
);

-- reviews table 
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  user_id INTEGER REFERENCES users(id),  
  item_id INTEGER REFERENCES items(id),
  created_at TIMESTAMP DEFAULT NOW()
);