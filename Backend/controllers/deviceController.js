const db = require('../db');



// Get devices by room ID
exports.getDevicesByRoomId = async (req, res) => {
  const { roomId } = req.params;  // Extract roomId from the request parameters
  const query = `
    SELECT d.Device_id, d.Device_name, d.Device_value, d.HubId, d.RoomId, d.TypeId, s.Status_value
    FROM Device d
    JOIN Status s ON d.StatusId = s.Status_id
    WHERE d.RoomId = ?;
  `;

  try {
    // Execute the query to fetch devices for the specified room ID
    db.query(query, [roomId], (err, devices) => {
      if (err) {
        console.error('Error fetching devices:', err);
        return res.status(500).json({ error: 'Failed to fetch devices' });
      }

      // If devices are found, return them 
      if (Array.isArray(devices) && devices.length > 0) {
        return res.json(devices);
      } else {
        // If no devices are found for the room, return a message
        return res.status(404).json({ message: 'No devices found for this room' });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Update device status
exports.updateDeviceStatus = async (req, res) => {
  const { deviceId } = req.params; // Extract deviceId from the request parameters
  const { status } = req.body; // Extract status from the request body
  const query = `
    UPDATE Device 
    SET StatusId = (SELECT Status_id FROM Status WHERE Status_value = ?)
    WHERE Device_id = ?;
  `;

  try {
    // Execute the query to update the device status
    db.query(query, [status, deviceId], (err, result) => {
      if (err) {
        console.error('Error updating status:', err);
        return res.status(500).json({ error: 'Failed to update status' });
      }

      // If no device was updated (affectedRows === 0)
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json({ message: 'Device status updated successfully' });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Update device value
exports.updateDeviceValue = async (req, res) => {
  const { deviceId } = req.params; // Extract deviceId from the request parameters
  const { device_value } = req.body; // Extract the device value from the request body

  // If the device value is missing
  if (!device_value) return res.status(400).json({ error: 'Device value is required' });

  const deviceQuery = `
    SELECT d.Device_id, d.Device_name, t.Device_type
    FROM Device d
    JOIN Type t ON d.TypeId = t.Type_id
    WHERE d.Device_id = ?;
  `;

  try {
    // Execute the query to fetch device details and its type
    db.query(deviceQuery, [deviceId], (err, deviceResults) => {
      if (err) {
        console.error('Error fetching device type:', err);
        return res.status(500).json({ error: 'Failed to fetch device type' });
      }

      // If no device is found
      if (deviceResults.length === 0) return res.status(404).json({ error: 'Device not found' });

      const device = deviceResults[0];
      let validValue = device_value; // Initialize validValue with the incoming device_value

      // Validate the device value based on device type
      if (device.Device_type === 'AC' || device.Device_type === 'Heater') {
        const tempValue = parseInt(device_value, 10);
        if (isNaN(tempValue) || tempValue < 17 || tempValue > 30) {
          return res.status(400).json({ error: 'Temperature must be between 17 and 30' });
        }
        validValue = tempValue.toString(); 
      } else if (device.Device_type === 'Fan') {
        const validSpeeds = ['low', 'medium', 'high'];
        if (!validSpeeds.includes(device_value.toLowerCase())) {
          return res.status(400).json({ error: 'Invalid speed value' });
        }
      } else if (device.Device_type === 'Blinds') {
        const validPositions = ['open', 'half-open', 'closed'];
        if (!validPositions.includes(device_value.toLowerCase())) {
          return res.status(400).json({ error: 'Invalid position value' });
        }
      }

      const updateQuery = 'UPDATE Device SET Device_value = ? WHERE Device_id = ?';
      // Execute the query to update the device value
      db.query(updateQuery, [validValue, deviceId], (err, result) => {
        if (err) {
          console.error('Error updating device value:', err);
          return res.status(500).json({ error: 'Failed to update device value' });
        }

        //If no device was updated (affectedRows === 0)
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Device not found or value unchanged' });
        }

        res.json({ message: 'Device value updated successfully' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
