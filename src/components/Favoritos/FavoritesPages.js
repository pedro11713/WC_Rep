// src/pages/FavoritesPage.js
import React, { useContext } from 'react';
import '../../styles/Favoritestyles.css';
import { FavoriteContext } from './FavoriteContext';
import { CartContext } from '../Carrinho/CartContext';

function FavoritesPage() {
  const { favoriteItems, removeFromFavorites } = useContext(FavoriteContext);
  const { addToCart } = useContext(CartContext);

  console.log("Itens favoritos no contexto:", favoriteItems);

  return (
    <div className="favorite-page">
      <header className="favorite-header">
        <h2>My Favorites</h2>
      </header>

      <main className="favorite-main">
        <section className="favorite-items">
          {favoriteItems.length === 0 ? (
            <p>You have no favorite items yet.</p>
          ) : (
            favoriteItems.map((item) => (
              <div key={item.id} className="favorite-card">
                <img src={item.image} alt={item.name} />
                <div className="favorite-info">
                  <h3>{item.name}</h3>
                  <p>€{item.price}</p>
                </div>
                <button
                  className="heart-button active"
                  onClick={() => removeFromFavorites(item.id)}
                >
                  ❤
                </button>
                <button
                  className="add-to-cart-button"
                  onClick={() => {
                    addToCart(item);
                    removeFromFavorites(item.id);
                  }}
                >
                  Add to cart
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default FavoritesPage;

