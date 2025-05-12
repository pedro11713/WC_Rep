import './App.css';
import PagInicialTogether from "./components/PagInicial/PagInicialTogether";
import PagProduto from "./components/PagProduto/PagProduto";
import ProductList from './components/PagProdutos/ProductList';
import Header from "./components/Header";
import Footer from "./components/Footer";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Header/>
            <Router>

                <Routes>
                    <Route path="/" element={<PagInicialTogether/>}/>
                    <Route path="/produto/:id" element={<PagProduto/>}/>
                    <Route path="/produtos" element={<ProductList/>}/>

                </Routes>
            </Router>
            <Footer/>
        </div>
    );
}

export default App;