const express = require('express');
const router = express.Router();

// Import the controller functions directly
const { registerUser, loginUser } = require('../controllers/authController');

// Define the routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
