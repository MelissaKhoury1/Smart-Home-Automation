// Import the mysql2 library to interact with the MySQL database
const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Database host 
  user: process.env.DB_USER, // The username used to access the database 
  password: process.env.DB_PASSWORD, // The password for the database user
  database: process.env.DB_NAME, // The name of the database to connect to
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
