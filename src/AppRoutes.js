// src/AppRoutes.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PagInicialTogether from "./components/PagInicial/PagInicialTogether";
import PagProduto from "./components/PagProduto/PagProduto";
import ProductList from './components/PagProdutos/ProductList';
import FavoritesPages from "./components/Favoritos/FavoritesPages";
import CartContent from "./components/Carrinho/CartContent";
import SuccessPage from './components/Carrinho/SuccessPage';
import LoginPage from './components/LoginRegister/LoginPage';
import RegisterPage from './components/LoginRegister/RegisterPage';
import StartPage from './components/LoginRegister/StartPage';

const AppRoutes = () => {
  const navigate = useNavigate();


  //useEffect(() => {
    //const token = localStorage.getItem("token");
    //if (!token && window.location.pathname === "/") {
      //navigate("/start");
   // }
  //}, []);

  return (
    <Routes>
      <Route path="/" element={<PagInicialTogether />} />
      <Route path="/produto/:id" element={<PagProduto />} />
      <Route path="/produtos" element={<ProductList />} />
      <Route path="/favoritos" element={<FavoritesPages />} />
      <Route path="/carrinho" element={<CartContent />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/start" element={<StartPage />} />
    </Routes>
  );
};

export default AppRoutes;
