import React from 'react';

const products = [
  { id: 1, name: 'Produto A', price: '€10' },
  { id: 2, name: 'Produto B', price: '€20' },
  { id: 3, name: 'Produto C', price: '€15' },
];

function TopProducts() {
  return (
    <div className="top-products">
      <h2>Produtos em Destaque</h2>
      <div className="product-list">
        {products.map((product) => (
          <div className="product" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopProducts;
