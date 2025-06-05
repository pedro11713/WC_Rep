import React, { useContext } from 'react';
import { FavoriteContext } from './FavoriteContext';
import { CartContext } from '../Carrinho/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/FavoriteStyles.css'; // Importa o seu ficheiro CSS

// PASSO 1: Importar a sua imagem
// Ajuste o caminho '../assets/Objeto.png' conforme a estrutura real do seu projeto.
// Este caminho assume que a pasta 'assets' está um nível acima de onde está este ficheiro.
import productImage from '../../assets/Objeto.png';

const FavoritesPages = () => {
  const { favoriteItems, removeFromFavorites } = useContext(FavoriteContext);
  const { addToCart } = useContext(CartContext);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

// Em FavoritesPages.jsx

const handleAddToCart = (product) => {
    if (!token) {
        alert("Precisa de fazer login para adicionar produtos ao carrinho.");
        navigate('/login');
        return;
    }

    // --- CORREÇÃO AQUI ---
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      quantity: 1,
      // Adiciona um tamanho e cor padrão, se existirem no objeto 'product'
      // Usa o primeiro valor do array como default.
      size: product.size && product.size.length > 0 ? product.size[0] : null,
      color: product.color && product.color.length > 0 ? product.color[0] : null,
    };
    // ----------------------

    addToCart(item);
    alert(`${product.name} foi adicionado ao carrinho!`);
};

  // Mensagens para utilizador não logado ou sem favoritos...
  if (!token) {
    return (
      <div className="favorite-page">
        <h1 className="favorite-header">Os teus Favoritos</h1>
        <p>Precisa de <Link to="/login">fazer login</Link> para ver os seus favoritos.</p>
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="favorite-page">
        <h1 className="favorite-header">Os teus Favoritos</h1>
        <p>A sua lista de favoritos está vazia.</p>
        <Link to="/" className="explore-button">Explorar Produtos</Link>
      </div>
    );
  }

  // JSX que corresponde ao seu CSS
  return (
    <div className="favorite-page">
      <header className="favorite-header">
        <h1>Os teus Favoritos</h1>
      </header>

      <main className="favorite-main">
        <div className="favorite-items">
          {favoriteItems.map((product) => (
            <div key={product.id} className="favorite-card">
              <Link to={`/products/${product.id}`}>
                {/*
                  PASSO 2: Usar a imagem importada 'productImage'
                  em vez de product.image_url.
                */}
                <img
                  src={productImage}
                  alt={product.name}
                />
              </Link>
              <div className="favorite-info">
                <h3>
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                <p>{product.description}</p>
                <span>{product.price.toFixed(2)}€</span>
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
              <button
                className="heart-button active"
                onClick={() => removeFromFavorites(product.id)}
                title="Remover dos Favoritos"
              >
                ❤️
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FavoritesPages;