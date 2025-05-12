// src/context/FavoriteContext.js
import React, { createContext, useState } from 'react';

export const FavoriteContext = createContext();

function FavoriteProvider(props) {
  const [favoriteItems, setFavoriteItems] = useState([]);

  function addToFavorites(item) {
  setFavoriteItems((prevItems) => {
    const exists = prevItems.find((i) => i.id === item.id);
    if (exists) return prevItems;
    const updated = [...prevItems, item];
    console.log("Favoritos atualizados:", updated); // <----
    return updated;
  });
}


  function removeFromFavorites(id) {
    setFavoriteItems((prevItems) =>
      prevItems.filter((item) => item.id !== id)
    );
  }

  return (
    <FavoriteContext.Provider value={{ favoriteItems, addToFavorites, removeFromFavorites }}>
      {props.children}
    </FavoriteContext.Provider>
  );
}

export default FavoriteProvider;
