// 404 error generic

import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>404 - Page Not Found</h1>
      <p style={styles.message}>404 Sorry This Page Does Not Exist</p>
      <button style={styles.button} onClick={() => navigate('/')}>
        Go to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
  },
  header: {
    fontSize: '2em',
    color: '#333',
  },
  message: {
    fontSize: '1.2em',
    color: '#666',
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
};

export default NotFound;
