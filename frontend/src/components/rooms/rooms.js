import React, { useState, useEffect } from 'react';
import './rooms.css';
import Header from '../header/header';

const RoomsPage = () => {
  const [roomsData, setRoomsData] = useState([]); // Stores all rooms data
  const [selectedRoom, setSelectedRoom] = useState(null); // Stores the selected room
  const [devices, setDevices] = useState([]); // Stores devices of the selected room
  const [newRoomName, setNewRoomName] = useState(''); // Stores the name of the new room
  const [isInputVisible, setIsInputVisible] = useState(false); // Toggles visibility of input form for adding a new room



  // Fetch rooms data from the backend 
  useEffect(() => {
    const fetchRoomsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms data');
        }
        const data = await response.json();
        setRoomsData(data);
      } catch (err) {
        console.error('Error fetching rooms data:', err);
      }
    };

    fetchRoomsData();
  }, []);



  // Fetch devices for a selected room from the backend
  const fetchDevices = async (roomId) => {
    setDevices([]); // Clear previously selected room devices
    setSelectedRoom(null); // Reset selected room state    

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/devices`);
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.Device_id - b.Device_id);
      if (sortedData.length === 0) {
        setDevices([]); // No devices in the room, clear devices state
      } else {
        setDevices(sortedData);
      }
      setSelectedRoom(roomId);
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

   // Handle room click to fetch devices and show context for that room
   const handleRoomClick = (roomId) => {
    fetchDevices(roomId);
    setIsInputVisible(false); // Hide the input form when a room is clicked
  };

  

  // Toggle device status and update both frontend and backend
  const toggleDevice = async (deviceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const data = await response.json();
      console.log('Response from backend:', data); // Log the response
  
      if (response.ok) {
        // Update the frontend with the new status
        updateDeviceStatus(deviceId, newStatus);
      } else {
        console.error('Error from backend:', data.error);
      }
    } catch (error) {
      console.error('Error toggling device:', error);
    }
  };
  
  
  
  // Update the device's status in the frontend
  const updateDeviceStatus = (deviceId, newStatus) => {
    console.log(`Updating frontend for device ${deviceId} to status ${newStatus}`); // Log the state change
    setDevices(devices.map(device => 
      device.Device_id === deviceId 
        ? { ...device, Status_value: newStatus } 
        : device
    ));
  };
  
  

  // Function to update the device value in frontend state
  const updateDeviceValue = async (deviceId, newValue) => {
    try {
      const response = await fetch(`http://localhost:5000/api/devices/${deviceId}/value`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_value: newValue }),
      });

      if (!response.ok) throw new Error('Failed to update device value');

      // Update the device value in frontend after successful backend update
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.Device_id === deviceId ? { ...device, Device_value: newValue } : device
        )
      );
    } catch (error) {
      console.error('Error updating device value:', error);
    }
  };



  // Handle add room functionality when the 'Add Room' button is clicked
  const handleAddRoomClick = () => {
    setIsInputVisible(true); // Show the input form from room name
  };



  // Handle room addition form submission
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) {
      alert("Room name can't be empty");
      return;
    }

    console.log("Adding new room with name:", newRoomName); // Add this log to check

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Room_name: newRoomName }), // Ensure backend expects 'Room_name'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Room name must be unique.');
      }

      const newRoom = await response.json();
      console.log("New room added:", newRoom); // Log the response

      // Ensure new room is added properly
      setRoomsData((prevRooms) => [...prevRooms, newRoom]);

      alert('Room added successfully');

      setNewRoomName(''); // Clear input field
      setIsInputVisible(false); // Hide input form
    } catch (err) {
      console.error('Error adding room:', err);
      alert(err.message); 
    }
  };



  return (
    <div className="container">
      <Header />
      <h2 className="title">Smart Home</h2>
      <div className="rooms-container">
        {roomsData.map((room) => (
          <div key={room.Room_id} className="room">
            <button onClick={() => handleRoomClick(room.Room_id)} className="room-link">
              {room.Room_name}
            </button>
          </div>
        ))}

        {/* Add Room Button */}
        <div className="room">
          <button onClick={handleAddRoomClick} className="room-link add-room-button">
            + Add Room
          </button>
        </div>
      </div>

      {/* Input field for adding a new room */}
      {isInputVisible && (
        <form onSubmit={handleAddRoomSubmit}>
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)} // Update the new room name
            placeholder="Enter new room name"
            className="room-input"
          />
          <button type="submit">Add</button>
        </form>
      )}

      {selectedRoom && (
        <div className="devices-container">
          {devices.length > 0 ? (
            devices.map((device) => (
              <div key={device.Device_id} className="device" id={`device-${device.Device_id}`}>
                <h4>{device.Device_name}</h4>

                {/* Display the status */}
                <p>
                  Status: <span className={`status ${device.Status_value === 'ON' ? 'on' : 'off'}`}>
                    {device.Status_value}
                  </span>
                </p>

                <div className="device-control">
                  <div>
                    <button
                      onClick={() => toggleDevice(device.Device_id, 'on')}
                      disabled={device.Status_value === 'ON'}
                    >
                      Turn ON
                    </button>
                    <button
                    onClick={() => toggleDevice(device.Device_id, 'off')}
                    disabled={device.Status_value === 'OFF'}
                    className={device.Status_value === 'OFF' ? 'off' : ''}
                    >
                      Turn OFF
                    </button>

                  </div>
                  {/* Show the value only if the device is NOT of type 'Light' */}
                {device.Type_id !== 1 && device.Device_value !== undefined && (
                  <div>
                    <p>Value: {device.Device_value}</p>
                    {/* Handle Temperature for AC/Heater */}
                  {device.TypeId === 2 || device.TypeId === 3 ? (
                    <input
                      type="number"
                      value={device.Device_value}
                      min="17"
                      max="30"
                      onChange={(e) => updateDeviceValue(device.Device_id, e.target.value)}
                    />
                  ) : null}

                  {/* Handle Position for Blinds */}
                  {device.TypeId === 5 ? (
                    <select
                      value={device.Device_value}
                      onChange={(e) => updateDeviceValue(device.Device_id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : null}


                  {/* Handle Speed for Fan */}
                  {device.TypeId === 4 ? (
                    <select
                      value={device.Device_value}
                      onChange={(e) => updateDeviceValue(device.Device_id, e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : null}
                  </div>
                )}
                </div>

              </div>
            ))
          ) : (
            <p>No devices available for this room.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;