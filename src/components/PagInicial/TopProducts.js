import React, { useState, useEffect } from 'react';
import productsData from '../../products.json'; // ajuste o caminho conforme necessário

function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    // Calcular média de avaliação para cada produto
    const productsWithRatings = productsData.map(product => {
      const totalScore = product.reviews.reduce((sum, review) => sum + review.score, 0);
      const avgScore = product.reviews.length > 0 ? totalScore / product.reviews.length : 0;
      return { ...product, avgScore };
    });

    // Ordenar por média de avaliação (descendente) e pegar os top 3
    const topRated = productsWithRatings
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);

    setTopProducts(topRated);
  }, []);

  return (
    <div className="top-products">
      <h2>Top Produtos (Melhor Avaliados)</h2>
      <div className="product-list">
        {topProducts.map(product => (
          <div className="product" key={product.id}>
            <h3>{product.name}</h3>
            <p>€{product.price.toFixed(2)}</p>
            <p>{product.category}</p>
            <p><strong>Avaliação Média:</strong> {product.avgScore.toFixed(1)} ⭐</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProducts;
