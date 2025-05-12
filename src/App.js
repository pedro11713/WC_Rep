import './App.css';
import PagInicialTogether from "./components/PagInicial/PagInicialTogether";
import PagProduto from "./components/PagProduto/PagProduto";
import ProductList from './components/PagProdutos/ProductList';
import CartPage from './components/Carrinho/CartPage';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FavoritePage from "./components/Favoritos/FavoritePage";

import FavoriteProvider from "./components/Favoritos/FavoriteContext";
import CartProvider from './components/Carrinho/CartContext';

function App() {
  return (
    <CartProvider>
      <FavoriteProvider>
        <div className="App">
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<PagInicialTogether />} />
              <Route path="/produto/:id" element={<PagProduto />} />
              <Route path="/produtos" element={<ProductList />} />
              <Route path="/favoritos" element={<FavoritePage />} />
              <Route path="/carrinho" element={<CartPage />} />
            </Routes>
            <Footer />
          </Router>
        </div>
      </FavoriteProvider>
    </CartProvider>
  );
}

export default App;



