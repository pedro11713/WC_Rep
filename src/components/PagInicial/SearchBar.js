import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchBar.css';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('Título');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (filter === 'Categoria') {
      fetch('http://localhost:5000/api/v1/products/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Erro ao buscar categorias:', err));
    }
  }, [filter]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function toggleFilters() {
    setShowFilters(!showFilters);
  }

  function handleSelectFilter(option) {
    setFilter(option);
    setShowFilters(false);
    setSearchTerm('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const query = new URLSearchParams({ search: searchTerm, filter }).toString();
    navigate(`/produtos?${query}`);
  }

  function handleCategoryClick(categoria) {
    const query = new URLSearchParams({ search: categoria, filter: 'Categoria' }).toString();
    navigate(`/produtos?${query}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={`Pesquisar por ${filter.toLowerCase()}...`}
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button type="submit" className="enter-button">Enter</button>
      <div className="filter-button-wrapper">
        <button type="button" className="filter-button" onClick={toggleFilters}>
          Filtros
        </button>
        {showFilters && (
          <ul className="filter-menu">
            <li onClick={() => handleSelectFilter('Título')}>Título</li>
            <li onClick={() => handleSelectFilter('Categoria')}>Categoria</li>
          </ul>
        )}
        {filter === 'Categoria' && categories.length > 0 && (
          <ul className="category-submenu">
            {categories.map(cat => (
              <li key={cat} onClick={() => handleCategoryClick(cat)} className="category-item">
                • {cat}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
