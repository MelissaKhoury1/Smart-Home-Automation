import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './signup.css';
import AuthHeader from '../authHeader/authHeader';

const SignUp = ({ onSignUp }) => {
  // States for form input fields and error handling
  const [userName, setUserName] = useState(''); // State for user name
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const [error, setError] = useState(''); // State for error message
  const navigate = useNavigate(); // For navigation after successful sign-up



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password === confirmPassword) {
      // Make the POST request to the backend to create a new user
      try {
        const response = await fetch('http://localhost:5000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            User_name: userName, 
            User_email: email,
            User_password: password,
            CloudId: 1, 
            HubId: 1    
          }),
        });

        const data = await response.json(); // Parse respond from backend

        if (response.ok) {
          navigate('/'); // Redirect to login page after successful sign-up
        } else {
          setError(data.message); // Display error message if response is not ok
        }
      } catch (err) {
        setError('Server error, please try again later');
      }
    } else {
      setError('Passwords do not match');
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="signup-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User Name" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)} // Update userName state on change
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state on change
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        {error && <p className="error-message">{error}</p>}  {/* Display error message if exists */}
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default SignUp;
