// detail page per item

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import Reviews from './Reviews';

const ItemDetails = () => {
  const { id } = useParams();
  const [items, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const handleReviewSubmit = (newReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/items/${id}`);
        if (!response.ok) {
          throw new Error('Item not found');
        }
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };

    fetchItemDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!items) {
    return <div>No item found</div>;
  }

  return (
    <div>
      <h1>Item Details</h1>
      <h2>{items.name}</h2>
      <p>Rating: {items.rating}</p>
      <p>Description: {items.description}</p>
      <ReviewForm itemId={itemId} onReviewSubmit={handleReviewSubmit} />
      <Reviews itemId={itemId} />
    </div>
  );
};

export default ItemDetails;
