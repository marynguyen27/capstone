import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [dishes, setDishes] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  const fetchDishes = async () => {
    try {
      const response = await fetch('http://localhost:3000/items');
      if (!response.ok) {
        throw new Error('Failed to fetch dishes');
      }
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const fetchItems = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/items?search=${searchQuery}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [searchQuery]);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className='container'>
      <h1 className='title'>Welcome to the Home Page!</h1>
      <p>
        Here you can browse a list of delicious dishes, read reviews, and more.
      </p>

      <div>
        <input
          type='text'
          placeholder='Search for a dish...'
          value={searchQuery}
          onChange={handleInputChange}
        />
        <ul className='item-list'>
          {filteredItems.length > 0
            ? filteredItems.map((item) => (
                <li key={item.id}>
                  <Link to={`/items/${item.id}`}>{item.name}</Link>{' '}
                </li>
              ))
            : searchQuery && <li>No items found</li>}
        </ul>
      </div>

      <h1>List of Dishes</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {dishes.length > 0 ? (
        <ul className='item-list'>
          {dishes.map((dish) => (
            <li key={dish.id} className='item-card'>
              <Link to={`/items/${dish.id}`}>{dish.name}</Link>{' '}
            </li>
          ))}
        </ul>
      ) : (
        <p>No dishes found.</p>
      )}
    </div>
  );
};

export default Home;
