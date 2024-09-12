import React, { useState } from 'react';

const ReviewForm = ({ itemId, onReviewSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const review = {
      text: reviewText,
      rating,
      user_id: 1,
      item_id: itemId,
    };

    try {
      const response = await fetch(`http://localhost:3000/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });
      const data = await response.json();
      onReviewSubmit(data);
      setReviewText('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='rating'>Rating (1-5):</label>
        <input
          type='number'
          id='rating'
          value={rating}
          min='1'
          max='5'
          onChange={(e) => setRating(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor='review'>Review:</label>
        <textarea
          id='review'
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />
      </div>
      <button type='submit'>Submit Review</button>
    </form>
  );
};

export default ReviewForm;
