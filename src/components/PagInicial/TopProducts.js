import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/TopProducts.css';

function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/products/featured')
      .then(response => response.json())
      .then(data => {
        const topRated = data
          .map(product => ({
            ...product,
            avgScore: product.avg_score || 0
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 3);

        setTopProducts(topRated);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos destacados:', error);
      });
  }, []);

  return (
    <div className="top-products">
      <h2>Top Produtos (Por Avaliação Média)</h2>
      <div className="product-list">
        {topProducts.map(product => (
          <Link key={product.id} to={`/produto/${product.id}`} className="product-link">
            <div className="product">
              <h3>{product.name}</h3>
              <p>€{product.price.toFixed(2)}</p>
              <p>{product.category}</p>
              <p>{product.avgScore.toFixed(1)} ⭐</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopProducts;
