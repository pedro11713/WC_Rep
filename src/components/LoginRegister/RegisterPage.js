// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao registar.");
        return;
      }

      alert("Conta criada com sucesso! Já podes fazer login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar ao servidor.");
    }
  }

  return (
    <div className="auth-container">
      <h2>Registo</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Palavra-passe"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Registar</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
