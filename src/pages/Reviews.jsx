import React, { useState, useEffect } from 'react';

const Reviews = ({ itemId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/items/${itemId}/reviews`
        );
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [itemId]);

  return (
    <div>
      <h2>Reviews</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <p>{review.text}</p>
            <p>Rating: {review.rating}/5</p>
            <p>By User {review.user_id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reviews;
