import React from "react";
import "./home.css";
import Header from "../header/header";

const HomePage = () => {
  return (
    <div className="containerH">
      <Header />
      <h2 className="titleH">Welcome to Your Smart Home</h2>
      <p className="welcome-text">Control and monitor your home devices efficiently.</p>
    </div>
  );
};

export default HomePage;
