import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedRating, setEditedRating] = useState(5);
  const [editCommentMode, setEditCommentMode] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        navigate('/login');
        return;
      }

      console.log('Token being sent:', token);

      try {
        const userResponse = await fetch('http://localhost:3000/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('User profile response:', userResponse);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setEmail(userData.email);
          const reviewsResponse = await fetch(
            `http://localhost:3000/reviews/user/${userData.id}`,
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
            `http://localhost:3000/comments/user/${userData.id}`,
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
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        navigate('/user-profile');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    }
  };

  const handleDelete = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}`,
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

  const handleEdit = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}`,
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
        `http://localhost:3000/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const updatedCommentsResponse = await fetch(
          `http://localhost:3000/comments/user/${user.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatedComments = await updatedCommentsResponse.json();
        setComments(updatedComments); // Update the state with fresh data
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
        `http://localhost:3000/comments/${commentId}`,
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
            comment.id === commentId ? updatedComment : comment
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
    <div style={styles.container}>
      <h1 style={styles.header}>User Profile</h1>
      <form onSubmit={handleUpdate} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor='email' style={styles.label}>
            Email:
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor='password' style={styles.label}>
            Password:
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type='submit' style={styles.button}>
          Update Email or Password
        </button>
      </form>
      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>

      <h2 style={styles.subHeader}>Your Reviews</h2>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
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
                  <button onClick={() => handleEdit(review.id)}>Save</button>
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
                  <button onClick={() => handleDelete(review.id)}>
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

      <h2 style={styles.subHeader}>Your Comments</h2>
      {comments.length > 0 ? (
        <ul style={styles.list}>
          {comments.map((comment) => (
            <li key={comment.comment_id} style={styles.listItem}>
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

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    textAlign: 'center',
  },
  header: {
    fontSize: '2.5em',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  subHeader: {
    fontSize: '2em',
    marginTop: '20px',
    marginBottom: '15px',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  },
  listItem: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
};

export default UserProfile;
