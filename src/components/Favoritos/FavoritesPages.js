// src/pages/FavoritesPage.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ necessário para redirecionar
import '../../styles/Favoritestyles.css';
import { FavoriteContext } from './FavoriteContext';
import { CartContext } from '../Carrinho/CartContext';

function FavoritesPage() {
  const { favoriteItems, removeFromFavorites } = useContext(FavoriteContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate(); // ✅ inicializa o hook de navegação

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
                {/* Imagem */}
                <div className="favorite-img-placeholder">
                  <span>Imagem</span>
                </div>

                {/* Informações do produto */}
                <div className="favorite-info">
                  <h3>{item.name}</h3>
                  <p>€{item.price.toFixed(2)}</p>
                </div>

                {/* Botões */}
                <div className="favorite-actions">
                  <button
                    className="heart-button active"
                    onClick={() => removeFromFavorites(item.id)}
                  >
                    ❤
                  </button>
                  <button
                    className="add-to-cart-button"
                    onClick={() => {
                      const itemComOpcoes = {
                        ...item,
                        size: item.size?.[0] || "default",
                        color: item.color?.[0] || "default",
                      };
                      addToCart(itemComOpcoes);
                      navigate("/carrinho");
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default FavoritesPage;
