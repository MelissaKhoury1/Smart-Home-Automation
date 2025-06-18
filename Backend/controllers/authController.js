const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 


// Register a new user
exports.registerUser = async (req, res) => {
  const { User_name, User_email, User_password, CloudId, HubId } = req.body;

  try {
    // Check if the user already exists by their email
    const checkUserQuery = 'SELECT * FROM USER WHERE User_email = ?';
    const [existingUser] = await db.promise().query(checkUserQuery, [User_email]);

    // If user already exists, return an error message
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Insert the new user into the database
    const query = 'INSERT INTO USER (User_name, User_email, User_password, CloudId, HubId) VALUES (?, ?, ?, ?, ?)';
    await db.promise().query(query, [User_name, User_email, User_password, CloudId, HubId]);

    // Return a success message upon successful registration
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Login an existing user
exports.loginUser = async (req, res) => {
  const { User_email, User_password } = req.body;

  try {
    // Find the user by email
    const query = 'SELECT * FROM USER WHERE User_email = ?';
    const [results] = await db.promise().query(query, [User_email]);

    // If user not found, return an error message
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

     // Check if the provided password matches the stored password
     if (user.User_password !== User_password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user.User_id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Middleware to check if the user is authenticated
exports.authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'yourSecretKey');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
