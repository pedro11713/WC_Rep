import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productsData from '../../products.json';
import '../../styles/TopProducts.css';

function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const productsWithRatings = productsData.map(product => {
      const totalScore = product.reviews.reduce((sum, review) => sum + review.score, 0);
      const avgScore = product.reviews.length > 0 ? totalScore / product.reviews.length : 0;
      return { ...product, avgScore };
    });

    const topRated = productsWithRatings
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    setTopProducts(topRated);
  }, []);

  return (
    <div className="top-products">
      <h2>Top Produtos (Por Avalição Média)</h2>
      <div className="product-list">
        {topProducts.map(product => (
          <Link key={product.id} to={`/produto/${product.id}`}  className="product-link">
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
