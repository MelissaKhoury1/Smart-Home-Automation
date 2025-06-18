// Import the mysql2 library to interact with the MySQL database
const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost', // Database host (localhost indicates the database is running on the same machine)
  user: 'root', // The username used to access the database (root is default, but consider using a specific user for security)
  password: 'MySql$$$2025', // The password for the database user
  database: 'smarthome', // The name of the database to connect to
});

// Connect to the database
db.connect((err) => {
  if (err) {
    // If there's an error during the connection, log the error with its stack trace
    console.error('Error connecting to the database:', err.stack);
  } else {
    // If the connection is successful, log a success message
    console.log('Connected to the database');
  }
});

// Export the connection object so it can be used in other parts of the application
module.exports = db;
