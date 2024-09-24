import React, { useState, useEffect } from 'react';

const ReviewComments = ({ reviewId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!reviewId) {
          console.log('Review ID is not defined');
          return;
        }

        const response = await fetch(
          `http://localhost:3000/comments/review/${reviewId}`
        );

        if (response.status === 404) {
          setComments([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.statusText}`);
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Unexpected error fetching comments:', error.message);
      }
    };

    fetchComments();
  }, [reviewId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `http://localhost:3000/comments/${reviewId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setText('');
        setError('');
      } else {
        setError('Failed to submit comment.');
      }
    } catch (error) {
      setError('Error submitting comment.');
    }
  };

  return (
    <div>
      <h4>Comments</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleAddComment}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Write a comment'
          required
        />
        <button type='submit'>Add Comment</button>
      </form>
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.text}</p>
              <p>By User {comment.user_id}</p>
            </li>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </ul>
    </div>
  );
};

export default ReviewComments;
