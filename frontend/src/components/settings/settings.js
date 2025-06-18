import React, { useEffect, useState } from 'react';
import './settings.css';
import Header from '../header/header';

const Settings = () => {
  // State variables to hold rooms, devices, room to remove, and smoke events data
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [roomToRemove, setRoomToRemove] = useState('');
  const [smokeEvents, setSmokeEvents] = useState([]);



  // Fetch Rooms from the backend API
  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      setRooms(data); // Set rooms state with the fetched data
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };



  // Fetch Devices from the backend API
  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devices');
      const data = await response.json();
      setDevices(data); // Set devices state with the fetched data
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };



  // Handle Room Deletion
  const handleRoomRemoval = async () => {
    if (roomToRemove) {
      try {
        // Send DELETE request to remove the selected room
        const response = await fetch(`http://localhost:5000/api/rooms/${roomToRemove}`, {
          method: 'DELETE',
        });

      if (response.ok) {
        // If successful, remove the room from the frontend state
        setRooms(rooms.filter(room => room.Room_id !== roomToRemove));
        setRoomToRemove('');  // Reset room to remove
        alert('Room removed successfully');
      } else {
        console.error('Error deleting room:', response.statusText);
      }
      } catch (error) {
      console.error('Error deleting room:', error);
      }
    }
  };

  
  
  // Handle Device Deletion
  const handleRemoveDevice = async (id) => {
    console.log('Attempting to remove device with ID:', id);
    try {
      // Send DELETE request to remove the selected device
      const response = await fetch(`http://localhost:5000/api/devices/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        console.log('Device removed successfully');
        // Remove the device from the frontend state after deletion
        setDevices((prevDevices) => prevDevices.filter(device => device.Device_id !== id));
      } else {
        console.error('Error deleting device:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };
  

  
  // Fetch Smoke Events from the backend API
  const fetchSmokeEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/smoke-events');
      const data = await response.json();
      setSmokeEvents(data);  // Set smoke events state with the fetched data
    } catch (error) {
      console.error('Error fetching smoke events:', error);
    }
  };



  // Fetch data (rooms, devices, and smoke events) on component mount
  useEffect(() => {
    fetchRooms();
    fetchDevices();
    fetchSmokeEvents();
  }, []);



  return (
    <div className="settings-container">
      <Header />
      <h2>Manage Rooms and Devices</h2>

      {/* Remove Room Form */}
      <div className="remove-room-form">
        <h3>Rooms</h3>
        <select value={roomToRemove} onChange={(e) => setRoomToRemove(e.target.value)}>
          <option value="">Select Room</option>
          {rooms.map(room => (
            <option key={room.Room_id} value={room.Room_id}>{room.Room_name}</option>
          ))}
        </select>
        <button onClick={handleRoomRemoval}>Remove Room</button>
      </div>

      {/* Devices Table */}
      <div className="devices-table">
        <h3>Devices</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.Device_name}>
                <td>{device.Device_name}</td>
                <td>{device.Room_name || 'Unknown Room'}</td> 
                <td>
                  <button className="remove-btn" onClick={() => handleRemoveDevice(device.Device_id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Smoke Events Table */}
      <div className="smoke-events-table">
        <h3>Smoke Events List</h3>
        <table>
          <thead>
            <tr>
              <th>Smoke Level</th>
              <th>Time of Detection</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {smokeEvents.map((event) => (
              <tr key={event.Event_id}>
                <td>{event.Smoke_level}</td>
                <td>{new Date(event.Time_of_detection).toLocaleString()}</td>
                <td>{event.Room_name || 'Unknown Room'}</td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
