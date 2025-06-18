import React, { useState, useEffect } from 'react';
import Header from '../header/header';
import './devices.css';

const Devices = () => {
  // State hooks to manage form and device data
  const [selectedRoom, setSelectedRoom] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [rooms, setRooms] = useState([]); // State for storing room data
  const [deviceTypes, setDeviceTypes] = useState([]); // State for storing device types
  const [error, setError] = useState(''); // State for handling errors
  const [devices, setDevices] = useState([]); // State for storing devices data
  const [deviceExists, setDeviceExists] = useState(false); // State for checking if a device already exists



  // Fetch rooms data from the backend
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms data');
        }
        const data = await response.json();
        setRooms(data); // Store fetched rooms data in state
      } catch (err) {
        console.error('Error fetching rooms data:', err);
      }
    };

    fetchRoomsData();
  }, []);


  
  // Fetch all devices data with room name, status, and value from the backend
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/devices/all');
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data = await response.json();
        setDevices(data); // Store fetched devices in state
      } catch (err) {
        console.error('Error fetching devices:', err);
      }
    };

    fetchDevices();
  }, []);



  // Fetch device types from the backend
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/types');
        if (!response.ok) {
          throw new Error('Failed to fetch types');
        }
        const data = await response.json();
        setDeviceTypes(data); // Store fetched types in state
      } catch (err) {
        console.error('Error fetching types data:', err);
      }
    };

    fetchTypes();
  }, []);



  // Handle form submission to add a new device
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!selectedRoom || !deviceType || !deviceName) {
        setError('Please select a room, device type, and enter a device name.');
        return;
    }

    setError('');

    // Get the selected device type name from the deviceTypes array
    const selectedType = deviceTypes.find(type => type.Type_id === parseInt(deviceType));

    // Set default device value based on the device type selected
    let deviceValue;
    switch (selectedType.Device_type) {
        case 'AC': 
            deviceValue = 20;
            break;
        case 'Heater': 
            deviceValue = 24;
            break;
        case 'Blinds': 
            deviceValue = 'open';
            break;
        case 'Fan': 
            deviceValue = 'low';
            break;
        case 'Lights':
            deviceValue = null;
            break;
        default:
            deviceValue = 'default_value'; 
    }

    console.log('Device Value: ', deviceValue);  // Log the device value for debugging

    // New device object to be added to the backend
    const newDevice = {
        device_name: deviceName,
        device_value: deviceValue,  
        hub_id: 1,  
        room_id: selectedRoom,
        type_id: deviceType,
        status_id: 2, 
    };

    try {
        const response = await fetch('http://localhost:5000/api/devices/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newDevice),
        });

        const data = await response.json();
        if (!response.ok) {
            if (data.message.includes('Device name already exists')) {
                throw new Error('Device name must be unique. Please choose another name.');
            } else {
                throw new Error(data.message || 'Failed to add device.');
            }
        }

        alert('Device added successfully');
        setDeviceName(""); // Clear the device name input field after success
    } catch (error) {
        console.error('Error adding device:', error);
        setError("Name already exist. Please choose another name. ");
    }
  };


  
  return (
    <div>
      <Header />
      <h3 className="titleD">Add Device</h3>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="container">
        {/* Room Selection */}
        <div className="form-group">
          <label>Room:</label>
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.Room_id} value={room.Room_id}>
                {room.Room_name}
              </option>
            ))}
          </select>
        </div>

        {/* Device Type Selection */}
        <div className="form-group">
          <label>Device Type:</label>
          <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
            <option value="">Select Type</option>
            {deviceTypes.map((type) => (
              <option key={type.Type_id} value={type.Type_id}>
                {type.Device_type}
              </option>
            ))}
          </select>
        </div>

        {/* Device Name Input */}
        <div className="form-group">
          <label>Device Name:</label>
          <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
        </div>

        {/* Submit Button */}
        <button type="submit">Add Device</button>
      </form>
      
      {/* Display all devices in a table */}
      <h3>All Devices</h3>
      <table>
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Room</th>
            <th>Status</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.Device_id}>
              <td>{device.Device_name}</td>
              <td>{device.Room_name}</td>
              <td>{device.Status_value}</td>
              <td>{device.Device_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Devices;
