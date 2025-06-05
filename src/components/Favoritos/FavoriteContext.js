// src/context/FavoriteContext.js
import React, { createContext, useState, useEffect } from 'react';

export const FavoriteContext = createContext();

function FavoriteProvider(props) {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Carrega os favoritos ao iniciar (opcionalmente com userId)
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/v1/favoritos?userId=guest");
        const data = await res.json();
        setFavoriteItems(data.favorites || []);
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }

    fetchFavorites();
  }, []);

  async function addToFavorites(item) {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/favoritos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "guest", product: item }),
      });
      if (res.ok) {
        setFavoriteItems((prev) => [...prev, item]);
      }
    } catch (err) {
      console.error("Erro ao adicionar favorito:", err);
    }
  }

  async function removeFromFavorites(id) {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/v1/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "guest", productId: id }),
      });
      if (res.ok) {
        setFavoriteItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
    }
  }

  function isFavorited(id) {
    return favoriteItems.some((item) => item._id === id);
  }

  return (
    <FavoriteContext.Provider
      value={{ favoriteItems, addToFavorites, removeFromFavorites, isFavorited }}
    >
      {props.children}
    </FavoriteContext.Provider>
  );
}

export default FavoriteProvider;
