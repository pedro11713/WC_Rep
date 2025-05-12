import React from 'react';
import FavoriteProvider from './FavoriteContext';
import CartProvider from '../Carrinho/CartContext';
import FavoriteContent from './FavoriteContent';

function FavoritePage() {
  return (
    <FavoriteProvider>
      <CartProvider>
        <FavoriteContent />
      </CartProvider>
    </FavoriteProvider>
  );
}

export default FavoritePage;