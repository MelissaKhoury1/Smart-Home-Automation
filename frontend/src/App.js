import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login/login';
import SignUp from './components/signup/signup';
import Home from './components/home/home';
import Rooms from './components/rooms/rooms'
import Settings from './components/settings/settings';
import Devices from './components/devices/devices'; // Import Devices Page

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/devices" element={<Devices />} /> {/* Devices Page */}
      </Routes>
    </Router>
  );
}

export default App;
