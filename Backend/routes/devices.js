const express = require('express');
const router = express.Router();

module.exports = (db) => {
  
  // Get all devices (GET request to fetch all devices)
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        d.Device_id, d.Device_name, d.Device_value, 
        r.Room_name, t.Device_type, s.Status_value
      FROM Device d
      JOIN Room r ON d.RoomId = r.Room_id
      JOIN Type t ON d.TypeId = t.Type_id
      JOIN Status s ON d.StatusId = s.Status_id;
    `;
    db.query(query, (err, results) => {
      if (err) {
        res.status(500).send({ message: 'Error fetching devices', error: err });
        return;
      }
      res.status(200).json(results);
    });
  });



  // Add a new device (POST request to add a new device to the database)
  router.post('/', async (req, res) => {
    const { device_name, device_value, hub_id, room_id, type_id, status_id } = req.body;

    // Validate the required fields
    if (!device_name || !hub_id || !room_id || !type_id || !status_id) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {

        // Set device_value to null if it's not provided in the request body
        const valueToInsert = device_value !== undefined ? device_value : null;

        // SQL query to insert a new device into the database
        const sql = "INSERT INTO Device (Device_name, Device_value, HubId, RoomId, TypeId, StatusId) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [device_name, valueToInsert, hub_id, room_id, type_id, status_id];

        // Execute the query to insert the device
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("MySQL Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.status(201).json({ message: "Device added successfully", deviceId: result.insertId });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  });


  // Update device status (PUT request to update the device status)
  router.put('/:device_id', (req, res) => {
    const { device_id } = req.params;
    const { status_id } = req.body;

    const query = `
      UPDATE Device 
      SET StatusId = ?
      WHERE Device_id = ?;
    `;

    // Execute the query to update the device's status
    db.query(query, [status_id, device_id], (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error updating device status', error: err });
        return;
      }
      res.status(200).send({ message: 'Device status updated' });
    });
  });

  return router; // Return the router so it can be used in the main app
};
