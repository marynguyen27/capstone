import React from 'react';

const Reviews = ({ reviews }) => {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          <p>Rating: {review.rating}/5</p>
          <p>{review.text}</p>
          <p>By User {review.user_id}</p>{' '}
        </li>
      ))}
    </ul>
  );
};

export default Reviews;
