import React from 'react';

import Banner from './Banner';
import SearchBar from "./SearchBar";
import TopProducts from "./TopProducts";

function PagInicialTogether() {
    return (
        <div className="PagInicialTogether">
            <Banner/>
            <SearchBar/>
            <TopProducts />
        </div>
    );
}

export default PagInicialTogether;
