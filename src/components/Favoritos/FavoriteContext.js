// src/context/FavoriteContext.js
import React, { createContext, useState } from 'react';

export const FavoriteContext = createContext();

function FavoriteProvider(props) {
  const [favoriteItems, setFavoriteItems] = useState([
  {
    id: 1,
    name: "Faux Fur Coat",
    price: 129.99,
    image: "/images/faux-fur-coat.jpg"
  },
    {
      id: 2,
      name: "Denim Jacket",
      price: 89.99,
      image: "/images/denim-jacket.jpg"
    }]);


  function addToFavorites(item) {
    setFavoriteItems((prevItems) => {
      const exists = prevItems.find((i) => i.id === item.id);
      if (exists) return prevItems;
      return [...prevItems, item];
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
