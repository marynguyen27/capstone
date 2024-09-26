import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import Reviews from './Reviews';
import ReviewComments from './ReviewComments';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id: currentItemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const loggedInUserId = localStorage.getItem('userId');
  const userToken = localStorage.getItem('token');

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return null;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const itemResponse = await fetch(
          `http://localhost:3000/items/${currentItemId}`
        );
        const itemData = await itemResponse.json();
        setItem(itemData);

        const reviewsResponse = await fetch(
          `http://localhost:3000/items/${currentItemId}/reviews`
        );
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item or reviews:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [currentItemId]);

  const handleReviewSubmit = async (reviewText, reviewRating) => {
    const review = {
      text: reviewText,
      rating: reviewRating,
      userId: loggedInUserId,
      itemId: currentItemId,
    };

    try {
      const response = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(review),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([...reviews, newReview]);
        console.log('Review saved successfully:', newReview);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Error submitting review');
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!item) {
    return <div>No item found</div>;
  }

  const averageRating = calculateAverageRating(reviews);

  return (
    <div className='item-details-container'>
      <h1 className='item-details-header'>Item Details</h1>
      <h2 className='item-details-subheader'>{item.name}</h2>
      <p className='average-rating'>
        Average Rating: {averageRating ? averageRating : 'No ratings yet'}
      </p>
      <p className='item-details-description'>
        Description: {item.description}
      </p>

      <h2 className='item-details-subheader'>Reviews</h2>
      <div className='reviews-section'>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className='review-item'>
              <p className='review-rating'>Rating: {review.rating}</p>
              <p>{review.text}</p>
              <ReviewComments reviewId={review.id} />
            </div>
          ))
        ) : (
          <p>No reviews listed</p>
        )}
      </div>

      {error && <p className='error-message'>Error: {error}</p>}

      <h2 className='leave-review-section'>Leave a Review</h2>
      <ReviewForm itemId={currentItemId} onReviewSubmit={handleReviewSubmit} />
    </div>
  );
};

export default ItemDetails;
