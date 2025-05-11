// components/PagProdutos/ProductList.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search')?.toLowerCase() || '';
  const filter = queryParams.get('filter') || 'Título';

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        let filtered = data;

        if (search) {
          filtered = data.filter(p => {
            if (filter === 'Título') return p.name.toLowerCase().includes(search);
            if (filter === 'Categoria') return p.category.toLowerCase().includes(search);
            if (filter === 'Tipo') return p.category.split(' - ')[0].toLowerCase().includes(search);
            return true;
          });
        }

        if (sortOption === 'Preço') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'Rating') {
          filtered.sort((a, b) => {
            const avgA = a.reviews.reduce((s, r) => s + r.score, 0) / a.reviews.length || 0;
            const avgB = b.reviews.reduce((s, r) => s + r.score, 0) / b.reviews.length || 0;
            return avgB - avgA;
          });
        }

        setProducts(filtered);
      });
  }, [search, filter, sortOption]);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const displayedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="product-page">
      <h2>Todos os Produtos</h2>

      <div className="filters">
        <label>Ordenar por: </label>
        <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
          <option value="">Nenhum</option>
          <option value="Preço">Preço</option>
          <option value="Rating">Rating</option>
        </select>
      </div>

      <div className="product-grid">
        {displayedProducts.map(product => (
          <div className="product-card" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.category}</p>
            <p>€{product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
