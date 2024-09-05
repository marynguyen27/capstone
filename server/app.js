const express = require('express');
const app = express();

app.use(express.json());

const itemsRouter = require('./routes/items');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');
const commentsRouter = require('./routes/comments');

app.use('/items', itemsRouter);
app.use('/users', usersRouter);
app.use('/reviews', reviewsRouter);
app.use('/comments', commentsRouter);

module.exports = app;
