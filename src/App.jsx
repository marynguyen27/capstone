import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import ItemDetails from './pages/ItemDetails';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/item/:id' element={<ItemDetails />} />
          <Route path='/user-profile' element={<UserProfile />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
