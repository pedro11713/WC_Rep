import React, { createContext, useState } from 'react';

export const CartContext = createContext();

function CartProvider(props) {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Faux Fur Coat',
      price: 129.99,
      image: '/images/faux-fur-coat.jpg',
      quantity: 1,
      size: 'medium',
      color: 'black'
    }
  ]);

  function addToCart(item) {
    setCartItems(function (prevItems) {
      var exists = prevItems.find(function (i) {
        return i.id === item.id;
      });

      if (exists) {
        return prevItems.map(function (i) {
          if (i.id === item.id) {
            return { ...i, quantity: i.quantity + 1 };
          }
          return i;
        });
      }

      return prevItems.concat({ ...item, quantity: 1 });
    });
  }

  function removeItem(id) {
    setCartItems(function (prevItems) {
      return prevItems.filter(function (item) {
        return item.id !== id;
      });
    });
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
      value={{ cartItems, addToCart, removeItem, updateQuantity }}
    >
      {props.children}
    </CartContext.Provider>
  );
}

export default CartProvider;

