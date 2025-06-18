import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login.css';
import AuthHeader from '../authHeader/authHeader';

const Login = ({ onLogin }) => {
  // States for email, password, and error handling
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [error, setError] = useState(''); // State for error message
  const navigate = useNavigate(); // For navigation after successful login



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Make the POST request to the backend
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          User_email: email, // Send email to backend
          User_password: password, // Send password to backend
        }),
      });
      
      const data = await response.json();

      console.log('Response data:', data); // Log the data to check what's being returned
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home'); // Redirect to the home page after login
      } else {
        setError(data.message); // Display error message
      }
    } catch (err) {
      setError('Server error, please try again later');
    }
  };



  return (
    <div>
      <AuthHeader />
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;
