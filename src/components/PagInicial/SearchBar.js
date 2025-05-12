import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchBar.css';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('Título');
  const navigate = useNavigate();

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function toggleFilters() {
    setShowFilters(!showFilters);
  }

  function handleSelectFilter(option) {
    setFilter(option);
    setShowFilters(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const query = new URLSearchParams({ search: searchTerm, filter }).toString();
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
            <li onClick={() => handleSelectFilter('Tipo')}>Tipo</li>
          </ul>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
