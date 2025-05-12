import './App.css';
import './styles/styles.css'
import PagInicialTogether from "./components/PagInicial/PagInicialTogether";
import PagProduto from "./components/PagProduto/PagProduto";
import ProductList from './components/PagProdutos/ProductList';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<PagInicialTogether />} />
                    <Route path="/produto/:id" element={<PagProduto />} />
                    <Route path="/produtos" element={<ProductList />} />

                </Routes>
            </Router>
        </div>
    );
}

export default App;