const express = require('express');
const router = express.Router();
const db = require('../db'); 


// A GET route that fetches data from the 'rooms' table
router.get('/', (req, res) => {
  // Query the 'Room' table to fetch all rooms
  db.query('SELECT * FROM Room', (err, results) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results); // Respond with the fetched room data 
    }
  });
});

module.exports = router; //Export the router so it can be used in the main app
