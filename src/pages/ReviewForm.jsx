import React, { useState } from 'react';

const ReviewForm = ({ onReviewSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onReviewSubmit(reviewText, reviewRating);
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Review:</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Rating:</label>
        <select
          value={reviewRating}
          onChange={(e) => setReviewRating(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <button type='submit'>Submit Review</button>
    </form>
  );
};

export default ReviewForm;
