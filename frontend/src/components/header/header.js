import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './header.css';

const Header = () => {
  const navigate = useNavigate();

   const handleLogout = () => {
    // Clear the auth token from localStorage and sessionStorage
    localStorage.removeItem('authToken');  
    sessionStorage.removeItem('authToken');

    // Redirect to login page after logout
    navigate("/", { replace: true }); 
  };

  return (
    <div className="header">
      <div className="welcome">
        <h1>Welcome</h1>
      </div>
      <div className="btn-container">
        <div className="btn-links">
          <Link to="/rooms">Rooms</Link>
          <Link to="/devices">Devices</Link>
          <Link to="/settings">Settings</Link> 
          <button onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
