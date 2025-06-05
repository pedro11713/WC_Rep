// src/pages/StartPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/StartPage.css";

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-container">
      <h1>Bem-vindo!</h1>
      <div className="start-buttons">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Registar</button>
      </div>
    </div>
  );
};

export default StartPage;
