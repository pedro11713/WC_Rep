// components/PagProdutos/ProductList.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import "../../styles/ProductList.css";
import SearchBar from '../PagInicial/SearchBar';

function ProductList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search')?.toLowerCase() || '';
  const filter = queryParams.get('filter') || 'Título';

  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState(''); // 'Preço' | 'Rating'
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/products?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos da API:", err);
        setProducts([]);
      });
  }, []);

  const filterProducts = () => {
    return products.filter((p) => {
      if (!search) return true;

      if (filter === 'Título') return p.name?.toLowerCase().includes(search);
      if (filter === 'Categoria') return p.category?.toLowerCase().includes(search);
      if (filter === 'Tipo') return p.category?.split(' - ')[0]?.toLowerCase().includes(search);

      return true;
    });
  };

  const sortProducts = (productsToSort) => {
    const sorted = [...productsToSort];
    if (sortOption === 'Preço') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Rating') {
      sorted.sort((a, b) => {
        const avgA = a.reviews?.reduce((s, r) => s + r.score, 0) / (a.reviews?.length || 1);
        const avgB = b.reviews?.reduce((s, r) => s + r.score, 0) / (b.reviews?.length || 1);
        return avgB - avgA;
      });
    }
    return sorted;
  };

  const filtered = filterProducts();
  const sorted = sortProducts(filtered);

  const totalPages = Math.ceil(sorted.length / productsPerPage);
  const displayedProducts = sorted.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="product-page">
      <h2>Todos os Produtos</h2>
      <SearchBar />

      <div className="sort-options">
        <label>Ordenar por: </label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Nenhum</option>
          <option value="Preço">Preço</option>
          <option value="Rating">Rating</option>
        </select>
      </div>

      <div className="product-grid">
        {displayedProducts.map((product) => (
          <Link
            key={product.id}
            to={`/produto/${product.id}`}
            className="product-card-link"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="product-card">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <p>€{product.price?.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
