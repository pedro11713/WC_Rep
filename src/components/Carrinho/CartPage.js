import React from 'react';
import CartProvider from './CartContext';
import CartContent from './CartContent';
import FavoriteProvider from "../Favoritos/FavoriteContext";

function CartPage() {
  return (
    <CartProvider>
        <FavoriteProvider>
            <CartContent />
        </FavoriteProvider>
    </CartProvider>
  );
}

export default CartPage;
