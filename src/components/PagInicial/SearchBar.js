import React, { useState } from 'react';
import '../../styles/SearchBar.css'; // Opcional, se preferires separar estilos

function SearchBar() {
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('Título');

  function toggleFilters() {
    setShowFilters(!showFilters);
  }

  function handleSelectFilter(option) {
    setFilter(option);
    setShowFilters(false);
  }

  return (
    <div className="search-bar">
      <input type="text" placeholder={`Pesquisar por ${filter.toLowerCase()}...`} />
      <div className="filter-button" onClick={toggleFilters}>
        ⬛
        {showFilters && (
          <ul className="filter-menu">
            <li onClick={() => handleSelectFilter('Título')}>Título</li>
            <li onClick={() => handleSelectFilter('Categoria')}>Categoria</li>
            <li onClick={() => handleSelectFilter('Tipo')}>Tipo</li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
