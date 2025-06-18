const express = require('express');
const router = express.Router();
const db = require('../db'); 


// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    // Execute a query to select room ID and room name from the 'Room' table
    const [rooms] = await db.execute('SELECT Room_id, Room_name FROM Room');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all devices
router.get('/devices', async (req, res) => {
  try {
    // Execute a query to select device details from the 'Device' table
    const [devices] = await db.execute(`
      SELECT Device_id, Device_name, Device_value, RoomId, HubId, TypeId, StatusId 
      FROM Device
    `);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a room (and all devices in it)
router.delete('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params; // Get the roomId from the route parameter
  try {
    // Delete devices in the room first
    const [deleteDevicesResult] = await db.execute('DELETE FROM Device WHERE RoomId = ?', [roomId]);
    console.log('Devices deleted:', deleteDevicesResult);

    // Delete the room itself
    const [deleteRoomResult] = await db.execute('DELETE FROM Room WHERE Room_id = ?', [roomId]);
    console.log('Room deleted:', deleteRoomResult);

    // Check if the room was actually deleted
    if (deleteRoomResult.affectedRows > 0) {
      res.json({ message: `Room ID ${roomId} and its devices deleted` });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (err) {
    console.error('Error during deletion:', err);
    res.status(500).json({ error: err.message });
  }
});


// Delete a device
router.delete('/devices/:id', async (req, res) => {
  const { id } = req.params; // Get the device ID from the route parameter
  try {
    // Delete the device with the specified ID
    await db.execute('DELETE FROM Device WHERE Device_id = ?', [id]);
    res.json({ message: `Device ID ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Export the router so it can be used in the main app
