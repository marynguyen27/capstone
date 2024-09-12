// page after user logged in, shows list of reviews, shows list of comments

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
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
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          setError('Access forbidden, token might be invalid.');
          return;
        }

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setEmail(userData.email);

          // Fetch user's reviews and comments
          const reviewsResponse = await fetch(
            `http://localhost:3000/reviews/user/${userData.id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const commentsResponse = await fetch(
            `http://localhost:3000/comments/user/${userData.id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          } else {
            setError('Failed to fetch reviews.');
          }

          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData);
          } else {
            setError('Failed to fetch comments.');
          }
        } else {
          setError('Failed to fetch user profile.');
        }
      } catch (error) {
        setError('An unexpected error occurred.');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
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

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>User Profile</h1>
      {user ? (
        <div>
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
              Update Profile
            </button>
          </form>

          <h2 style={styles.subHeader}>Your Reviews</h2>
          {reviews.length > 0 ? (
            <ul style={styles.list}>
              {reviews.map((review) => (
                <li key={review.id} style={styles.listItem}>
                  <p>{review.text}</p>
                  <p>Rating: {review.rating}</p>
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
                <li key={comment.id} style={styles.listItem}>
                  <p>{comment.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments found.</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
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
