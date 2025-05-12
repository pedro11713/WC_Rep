import './App.css';
import PagInicialTogether from "./components/PagInicial/PagInicialTogether";
import PagProduto from "./components/PagProduto/PagProduto";
import ProductList from './components/PagProdutos/ProductList';
import Header from "./components/Header";
import Footer from "./components/Footer";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import FavoritesPages from "./components/Favoritos/FavoritesPages";
import FavoriteProvider from "./components/Favoritos/FavoriteContext";
import CartProvider from "./components/Carrinho/CartContext";
import CartContent from "./components/Carrinho/CartContent";


function App() {
    return (
        <CartProvider>
            <FavoriteProvider>
                <Router>
                    <Header/>
                    <Routes>
                        <Route path="/" element={<PagInicialTogether/>}/>
                        <Route path="/produto/:id" element={<PagProduto/>}/>
                        <Route path="/produtos" element={<ProductList/>}/>
                        <Route path="/favoritos" element={<FavoritesPages/>}/>
                        <Route path="/carrinho" element={<CartContent/>}/>
                    </Routes>
                    <Footer/>
                </Router>
            </FavoriteProvider>
        </CartProvider>
    );
}

export default App;




