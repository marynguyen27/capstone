import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

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
    <div className='home'>
      <h1>Welcome to the Home Page!</h1>
      <p>
        Here you can browse a list of delicious dishes, read reviews, and more.
      </p>

      <div>
        <input
          type='text'
          placeholder='Search items...'
          value={searchQuery}
          onChange={handleInputChange}
        />
        <ul>
          {filteredItems.length > 0
            ? filteredItems.map((item) => (
                <li key={item.id}>
                  <Link to={`/items/${item.id}`}>{item.name}</Link>{' '}
                </li>
              ))
            : searchQuery && <li>No items found</li>}
        </ul>
      </div>
    </div>
  );
};

export default Home;
