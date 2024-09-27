import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editCommentMode, setEditCommentMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editedText, setEditedText] = useState('');
  const [editedRating, setEditedRating] = useState(5);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        navigate('/login');
        return;
      }

      try {
        const userResponse = await fetch(
          'https://capstone-5tiv.onrender.com/users/me',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setEmail(userData.email);
          const reviewsResponse = await fetch(
            `https://capstone-5tiv.onrender.com/reviews/user/${userData.id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);

          const commentsResponse = await fetch(
            `https://capstone-5tiv.onrender.com/comments/user/${userData.id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        } else {
          setError('Failed to fetch user profile.');
        }
      } catch (error) {
        setError('An unexpected error occurred.');
        console.error('Error:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const payload = { email };

    if (password) {
      payload.password = password;
    }

    try {
      const response = await fetch(
        `https://capstone-5tiv.onrender.com/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSuccess('Profile updated successfully.');
        setPassword('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `https://capstone-5tiv.onrender.com/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setReviews(reviews.filter((review) => review.id !== reviewId));
      } else {
        setError('Failed to delete review');
      }
    } catch (error) {
      setError('Error deleting review');
    }
  };

  const handleEditReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `https://capstone-5tiv.onrender.com/reviews/${reviewId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editedText, rating: editedRating }),
        }
      );

      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? updatedReview : review
          )
        );
        setEditMode(null);
      } else {
        setError('Failed to update review');
      }
    } catch (error) {
      setError('Error updating review');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `https://capstone-5tiv.onrender.com/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setComments(
          comments.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        setError('Failed to delete comment');
      }
    } catch (error) {
      setError('Error deleting comment');
    }
  };

  const handleEditComment = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `https://capstone-5tiv.onrender.com/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editedCommentText }),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(
          comments.map((comment) =>
            comment.comment_id === commentId ? updatedComment : comment
          )
        );
        setEditCommentMode(null);
      } else {
        setError('Failed to update comment');
      }
    } catch (error) {
      setError('Error updating comment');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container'>
      <h1 className='header'>User Profile</h1>
      <form onSubmit={handleUpdate} className='form'>
        <div className='form-group'>
          <label htmlFor='email' className='label'>
            Email:
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='input'
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password' className='label'>
            Password (optional):
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='input'
            placeholder='Enter new password'
          />
        </div>
        {success && <p className='success'>{success}</p>}
        {error && <p className='error'>{error}</p>}
        <button type='submit' className='button'>
          Update Email or Password
        </button>
      </form>
      <button onClick={handleLogout} className='button'>
        Logout
      </button>

      <h2 className='sub-header'>Your Reviews</h2>
      {reviews.length > 0 ? (
        <ul className='list'>
          {reviews.map((review) => (
            <li key={review.id} className='list-item'>
              {editMode === review.id ? (
                <div>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <input
                    type='number'
                    value={editedRating}
                    onChange={(e) => setEditedRating(e.target.value)}
                    min='1'
                    max='5'
                  />
                  <button onClick={() => handleEditReview(review.id)}>
                    Save
                  </button>
                  <button onClick={() => setEditMode(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <p>{review.text}</p>
                  <p>Rating: {review.rating}</p>
                  <button
                    onClick={() => {
                      setEditMode(review.id);
                      setEditedText(review.text);
                      setEditedRating(review.rating);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteReview(review.id)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews found.</p>
      )}

      <h2 className='sub-header'>Your Comments</h2>
      {comments.length > 0 ? (
        <ul className='list'>
          {comments.map((comment) => (
            <li key={comment.comment_id} className='list-item'>
              {editCommentMode === comment.comment_id ? (
                <div>
                  <textarea
                    value={editedCommentText}
                    onChange={(e) => setEditedCommentText(e.target.value)}
                  />
                  <button onClick={() => handleEditComment(comment.comment_id)}>
                    Save
                  </button>
                  <button onClick={() => setEditCommentMode(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Comment:</strong> {comment.comment_text}
                  </p>
                  <p>
                    <strong>For Item:</strong>{' '}
                    <Link to={`/items/${comment.item_id}`}>
                      {comment.item_name}
                    </Link>
                  </p>
                  <button
                    onClick={() => {
                      setEditCommentMode(comment.comment_id);
                      setEditedCommentText(comment.comment_text);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments found.</p>
      )}
    </div>
  );
};

export default UserProfile;
