const express = require('express'); 
require('dotenv').config(); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const authRoutes = require('./routes/authRoutes'); 
const roomsRoute = require('./routes/rooms'); 
const devicesRoute = require('./routes/devices'); 
const { authenticateUser } = require('./controllers/authController'); 
const db = require('./db');

const app = express(); 

const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: 'GET,POST,PUT,DELETE', 
  allowedHeaders: 'Content-Type,Authorization', 
};


app.use(cors(corsOptions)); 
app.use(bodyParser.json());  
app.use(express.json()); 


app.use('/api', roomsRoute); 
app.use('/api/devices', devicesRoute(db)); 


app.use('/api/devices/all', devicesRoute(db)); 


// Authentication routes for login, registration, etc.
app.use('/auth', authRoutes); 


// Middleware to log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


//Protected route that requires authentication
app.get('/protected', authenticateUser, (req, res) => {
  // This route is protected by the authenticateUser middleware.
  // It will only be accessible if the user is authenticated.
  res.json({ message: 'This is a protected route, you are authenticated!', userId: req.userId });
});



//Rooms Page



// Endpoint to get all rooms from the database
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT * FROM Room';  // SQL query to get all rooms
  db.query(query, (err, results) => { // Execute the query
    if (err) {
      console.error('Error fetching rooms data:', err); // Log error if query fails
      return res.status(500).json({ error: 'Failed to fetch rooms' }); // Respond with error message
    }
    res.json(results); // Send the rooms data as a JSON response
  });
});



// Endpoint to get all types from the database
app.get('/api/types', (req, res) => {
  const query = 'SELECT * FROM Type'; // SQL query to get all types
  db.query(query, (err, results) => { // Execute the query
    if (err) {
      console.error('Error fetching types data:', err); // Log error if query fails
      return res.status(500).json({ error: 'Failed to fetch types' }); // Respond with error message
    }
    res.json(results); // Send the types data as a JSON response
  });
});



// Endpoint to add a new room
app.post('/api/rooms/', (req, res) => {
  const { Room_name } = req.body; // Get the room name from the request body

  // Check if the room name already exists in the database
  db.query('SELECT * FROM Room WHERE Room_name = ?', [Room_name], (err, results) => {
    if (err) {
      console.error('Error checking room name:', err); // Log error if query fails
      return res.status(500).send('Internal Server Error'); // Respond with generic error message
    }

    if (results.length > 0) {
      // If a room with the same name already exists, return a bad request error
      return res.status(400).json({ error: 'Room name must be unique' });
    }

    // If the room name is unique, insert the new room into the database
    db.query('INSERT INTO Room (Room_name) VALUES (?)', [Room_name], (err, result) => {
      if (err) {
        console.error('Error adding room:', err); // Log error if query fails
        return res.status(500).send('Internal Server Error'); // Respond with generic error message
      }

      // Return the newly added room as a JSON response, including its ID
      res.status(201).json({ Room_id: result.insertId, Room_name });
    });
  });
});



// Route to fetch devices for a specific room
app.get('/api/rooms/:roomId/devices', async (req, res) => {
  const { roomId } = req.params;  // Capture roomId from the URL parameter
  console.log('Room ID:', roomId);  // Log the roomId to check if it's being captured correctly

  // SQL query to fetch devices for the specified room, joining with the Status table to get the status value
  const query = `
    SELECT d.Device_id, d.Device_name, d.Device_value, d.HubId, d.RoomId, d.TypeId, s.Status_value
    FROM Device d
    JOIN Status s ON d.StatusId = s.Status_id
    WHERE d.RoomId = ?;
  `;

  // Execute the SQL query
  db.query(query, [roomId], (err, devices) => {
    if (err) {
      console.error('Error fetching devices:', err); // Log the error if query fails
      return res.status(500).json({ error: 'Failed to fetch devices' }); // Respond with an error message
    }

    console.log('Devices fetched:', devices);  // Log the devices to check their structure

    // Check if devices were found for the given room
    if (Array.isArray(devices) && devices.length > 0) {
      return res.json(devices);  // Return devices as JSON if found
    } else {
      return res.status(404).json({ message: 'No devices found for this room' }); // Respond with a 404 if no devices are found
    }
  });
});



// Route to update the status of a device
app.put('/api/devices/:deviceId/status', (req, res) => {
  const { deviceId } = req.params;  // Capture deviceId from the URL parameter
  const { status } = req.body;  // Capture the new status from the request body

  console.log(`Received request to update device ${deviceId} to status ${status}`); // Log request data

  // SQL query to update the status of the specified device based on the status value
  const query = `
    UPDATE Device 
    SET StatusId = (SELECT Status_id FROM Status WHERE Status_value = ?)
    WHERE Device_id = ?;
  `;

  // Execute the SQL query
  db.query(query, [status, deviceId], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);  // Log error if the update fails
      return res.status(500).json({ error: 'Failed to update status' }); // Respond with an error message
    }

    console.log('Database update result:', result); // Log the result of the update operation
    res.json({ message: 'Status updated successfully' }); // Respond with a success message
  });
});



// Route to update the value of a device
app.put('/api/devices/:deviceId/value', (req, res) => {
  const { deviceId } = req.params; // Capture the deviceId from the URL parameter
  const { device_value } = req.body; // Capture the new device value from the request body

  // Check if the device value is provided in the request body
  if (!device_value) {
    return res.status(400).json({ error: 'Device value is required' }); // Respond with a 400 if no value is provided
  }

  // SQL query to fetch the device details, including its type
  const deviceQuery = `
    SELECT d.Device_id, d.Device_name, t.Device_type
    FROM Device d
    JOIN Type t ON d.TypeId = t.Type_id
    WHERE d.Device_id = ?
  `;

  // Execute the query to fetch the device details
  db.query(deviceQuery, [deviceId], (err, deviceResults) => {
    if (err) {
      console.error('Error fetching device type:', err); // Log error if query fails
      return res.status(500).json({ error: 'Failed to fetch device type' }); // Respond with a 500 error
    }

    // Check if the device was found
    if (deviceResults.length === 0) {
      return res.status(404).json({ error: 'Device not found' }); // Respond with a 404 if device doesn't exist
    }

    const device = deviceResults[0]; // Get the device details from the result

    // Validate the device value based on the device type
    let validValue = device_value; // Initially set the device value to the input value
    if (device.Device_type === 'AC' || device.Device_type === 'Heater') {
      // If device is AC or Heater, ensure the temperature is between 17 and 30
      const tempValue = parseInt(device_value, 10); // Parse the temperature value
      if (isNaN(tempValue) || tempValue < 17 || tempValue > 30) {
        return res.status(400).json({ error: 'Temperature must be between 17 and 30' }); // Respond if the temperature is out of range
      }
      validValue = tempValue.toString(); // Convert valid temperature to a string for consistency
    } else if (device.Device_type === 'Fan') {
      // If device is a Fan, ensure the speed is one of the valid options (low, medium, high)
      const validSpeeds = ['low', 'medium', 'high'];
      if (!validSpeeds.includes(device_value.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid speed value' }); // Respond with an error if speed is invalid
      }
    } else if (device.Device_type === 'Blinds') {
      // If device is Blinds, ensure the position is one of the valid options (open, half-open, closed)
      const validPositions = ['open', 'half-open', 'closed'];
      if (!validPositions.includes(device_value.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid position value' }); // Respond if position is invalid
      }
    }

    // SQL query to update the device value in the database
    const updateQuery = 'UPDATE Device SET Device_value = ? WHERE Device_id = ?';
    db.query(updateQuery, [validValue, deviceId], (err, result) => {
      if (err) {
        console.error('Error updating device value:', err); // Log error if update fails
        return res.status(500).json({ error: 'Failed to update device value' }); // Respond with a 500 error
      }

      // Check if any rows were affected (i.e., the device was updated)
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Device not found or value unchanged' }); // Respond if device was not updated
      }

      // If update was successful, respond with a success message
      res.json({ message: 'Device value updated successfully' });
    });
  });
});



//Devices Page



// Unified endpoint to add a new device
app.post('/api/devices', (req, res) => {
  const { deviceName, roomId, deviceType, statusId } = req.body;

  if (!deviceName || !roomId || !deviceType || !statusId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the device already exists in the room
  const checkQuery = "SELECT * FROM Device WHERE Device_name = ? AND RoomId = ?";
  db.query(checkQuery, [deviceName, roomId], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: `A device with the name '${deviceName}' already exists in this room.` });
    }

    // Default values based on device type
    let device_value;
    switch (deviceType) {
      case 'light':
        device_value = 'off'; // Lights are off by default
        break;
      case 'ac':
        device_value = '20'; // AC default temperature is 20
        break;
      case 'heater':
        device_value = '24'; // Heater default temperature is 24
        break;
      case 'blinds':
        device_value = 'open'; // Blinds are open by default
        break;
      case 'fan':
        device_value = 'low'; // Fan default speed is low
        break;
      default:
        return res.status(400).json({ error: 'Invalid device type' });
    }

    // Insert the new device
    const insertQuery = "INSERT INTO Device (Device_name, Device_value, RoomId, TypeId, StatusId) VALUES (?, ?, ?, ?, ?)";
    db.query(insertQuery, [deviceName, device_value, roomId, deviceType, statusId], (err, result) => {
      if (err) {
        console.error('Error inserting device:', err);
        return res.status(500).json({ error: "Failed to add device. Please try again later." });
      }
      res.status(201).json({ message: "Device added successfully!" });
    });
  });
});



// Fetch available device types
app.get('/api/deviceTypes', (req, res) => {
  // Query to fetch all device types from the Type table
  const query = 'SELECT * FROM Type';

  // Execute the query
  db.query(query, (err, result) => {
    // Error handling: If there is a database query error
    if (err) {
      return res.status(500).send('Error fetching device types'); // Return an error response
    }

    // Success: Return the fetched device types as a JSON response
    res.json(result);
  });
});



// Route to fetch all devices with room name, status, and device value
app.get('/all', (req, res) => {
  // SQL query to fetch devices with associated room name and status value
  const query = `
      SELECT 
          d.Device_id, 
          d.Device_name, 
          d.Device_value, 
          r.Room_name, 
          s.Status_value
      FROM Device d
      JOIN Room r ON d.RoomId = r.Room_id  // Join the 'Room' table based on matching RoomId
      JOIN Status s ON d.StatusId = s.Status_id;  // Join the 'Status' table based on matching StatusId
  `;
  
  // Execute the query
  db.query(query, (err, results) => {
      // Error handling for the query execution
      if (err) {
          console.error('Error fetching devices with room name and status:', err);  // Log the error for debugging
          return res.status(500).send({ message: 'Error fetching devices with room name and status', error: err });  // Return 500 error response with the error message
      }

      // Success: Return the results of the query as a JSON response
      res.status(200).json(results);  // Send back the fetched devices along with room names and status
  });
});



//Settings Page



// Route to remove a room
app.delete('/api/rooms/:roomId', (req, res) => {
  // Extract the roomId from the request parameters
  const { roomId } = req.params;

  // Step 1: Check if the room exists in the database
  const checkRoomQuery = 'SELECT * FROM Room WHERE Room_id = ?';
  db.query(checkRoomQuery, [roomId], (err, results) => {
    // Error handling for database query
    if (err) {
      console.error('Error checking room existence:', err); // Log error for debugging
      return res.status(500).send('Internal Server Error'); // Send 500 error if something goes wrong
    }

    // If no room is found with the provided roomId
    if (results.length === 0) {
      return res.status(404).json({ error: 'Room not found' }); // Return 404 error if room does not exist
    }

    // Step 2: Delete all devices assigned to this room
    const deleteDevicesQuery = 'DELETE FROM Device WHERE RoomId = ?';
    db.query(deleteDevicesQuery, [roomId], (err, result) => {
      // Error handling for deleting devices
      if (err) {
        console.error('Error deleting devices:', err); // Log error for debugging
        return res.status(500).send('Internal Server Error'); // Send 500 error if device deletion fails
      }

      // Step 3: Delete the room itself
      const deleteRoomQuery = 'DELETE FROM Room WHERE Room_id = ?';
      db.query(deleteRoomQuery, [roomId], (err, result) => {
        // Error handling for deleting the room
        if (err) {
          console.error('Error deleting room:', err); // Log error for debugging
          return res.status(500).send('Internal Server Error'); // Send 500 error if room deletion fails
        }

        // Success: Room and its devices deleted
        res.status(200).json({ message: 'Room and its devices deleted successfully' }); // Return success message
      });
    });
  });
});



// Route to get all devices with their room names
app.get('/devices', async (req, res) => {
  try {
    // SQL query to fetch device information along with the room name
    const query = `
      SELECT devices.Device_id, devices.Device_name, devices.Device_type, rooms.Room_name, devices.Status_value 
      FROM devices
      LEFT JOIN rooms ON devices.RoomId = rooms.Room_id
    `;

    // Execute the query using async/await with db.execute
    const [devices] = await db.execute(query);  // Executes the query and returns the result in 'devices'

    // Send the devices data as JSON response
    res.json(devices);  // Respond with the retrieved devices data
  } catch (err) {
    // If there's an error, catch it and return a 500 status with the error message
    res.status(500).json({ error: err.message });  // Return error details
  }
});



// Route to remove a device
app.delete('/api/devices/:deviceId', (req, res) => {
  // Extract the deviceId from the request parameters
  const { deviceId } = req.params;

  // Step 1: Check if the device exists in the database
  const checkDeviceQuery = 'SELECT * FROM Device WHERE Device_id = ?';
  db.query(checkDeviceQuery, [deviceId], (err, results) => {
    // Error handling for database query
    if (err) {
      console.error('Error checking device existence:', err); // Log error for debugging
      return res.status(500).send('Internal Server Error'); // Send 500 error if something goes wrong
    }

    // If no device is found with the provided deviceId
    if (results.length === 0) {
      return res.status(404).json({ error: 'Device not found' }); // Return 404 error if device does not exist
    }

    // Step 2: Delete the device from the database
    const deleteDeviceQuery = 'DELETE FROM Device WHERE Device_id = ?';
    db.query(deleteDeviceQuery, [deviceId], (err, result) => {
      // Error handling for deleting the device
      if (err) {
        console.error('Error deleting device:', err); // Log error for debugging
        return res.status(500).send('Internal Server Error'); // Send 500 error if device deletion fails
      }

      // Success: Device deleted
      res.status(200).json({ message: 'Device deleted successfully' }); // Return success message
    });
  });
});



// Route to fetch smoke events with room name
app.get('/api/smoke-events', async (req, res) => {
  try {
    // SQL query to retrieve smoke event details along with the associated room name
    const query = `
      SELECT se.Event_id, se.Smoke_level, se.Time_of_detection, r.Room_name, se.CloudId 
      FROM SmokeEvents se 
      JOIN SmokeDetector sd ON se.DetectorId = sd.Detector_id
      JOIN Room r ON sd.RoomId = r.Room_id;  
    `;

    // Execute the query using a promise-based approach (db.promise().query)
    const [results] = await db.promise().query(query);  // 'results' contains the fetched data

    // Send the results as a JSON response
    res.json(results);
  } catch (error) {
    // If there's an error, log it and send a 500 status code with a message
    console.error('Error fetching smoke events:', error);
    res.status(500).send('Error fetching smoke events');
  }
});



// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});