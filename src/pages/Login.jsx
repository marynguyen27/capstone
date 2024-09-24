import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log('Login response data:', data);

      if (response.ok) {
        const { token, userId } = data;
        console.log('userId:', userId);

        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);

        navigate('/user-profile');
      } else {
        setError(data.error || 'Login failed, please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login');
  };

  if (isLoggedIn) {
    return (
      <div className='container'>
        <h1 className='title'>You Are Logged In</h1>
        <button onClick={() => navigate('/user-profile')}>Go to Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className='container'>
      <h1 className='title'>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>
        Don't have an account? <a href='/signup'>Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
