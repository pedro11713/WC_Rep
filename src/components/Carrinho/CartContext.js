import React, { createContext, useState } from 'react';

export const CartContext = createContext();

function CartProvider(props) {
  const [cartItems, setCartItems] = useState([

  ]);

  function addToCart(item) {
    setCartItems((prevItems) => {
      const exists = prevItems.find((i) =>
        i.id === item.id &&
        i.size === item.size &&
        i.color === item.color
      );

      if (exists) {
        return prevItems.map((i) => {
          if (
            i.id === item.id &&
            i.size === item.size &&
            i.color === item.color
          ) {
            return { ...i, quantity: i.quantity + 1 };
          }
          return i;
        });
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });
  }


  function removeItem(id) {
    setCartItems(function (prevItems) {
      return prevItems.filter(function (item) {
        return item.id !== id;
      });
    });
  }

  function clearCart() {
  setCartItems([]);
  }


  function updateQuantity(id, newQuantity) {
    setCartItems(function (prevItems) {
      return prevItems.map(function (item) {
        if (item.id === id) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  }

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeItem, updateQuantity, clearCart }}
    >
      {props.children}
    </CartContext.Provider>
  );
}

export default CartProvider;

