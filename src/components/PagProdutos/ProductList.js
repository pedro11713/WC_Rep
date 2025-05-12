// components/PagProdutos/ProductList.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import productsData from '../../products.json';
import "../../styles/ProductList.css";
import SearchBar from '../PagInicial/SearchBar';

function ProductList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search')?.toLowerCase() || '';
  const filter = queryParams.get('filter') || 'Título';
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    let filtered = productsData;

    if (search) {
      filtered = productsData.filter(p => {
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
  }, [search, filter, sortOption]);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const displayedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="product-page">
      <h2>Todos os Produtos</h2>
      <SearchBar />

      <div className="product-grid">
        {displayedProducts.map(product => (
          <Link
            key={product.id}
            to={`/produto/${product.id}`}
            className="product-card-link"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="product-card">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>€{product.price.toFixed(2)}</p>
            </div>
          </Link>
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
