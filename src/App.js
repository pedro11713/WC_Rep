import './App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router } from "react-router-dom";
import { FavoriteProvider  } from './components/Favoritos/FavoriteContext';
import { CartProvider } from './components/Carrinho/CartContext';
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <CartProvider>
      <FavoriteProvider >
        <Router>
          <Header />
          <AppRoutes />
          <Footer />
        </Router>
      </FavoriteProvider >
    </CartProvider>
  );
}

export default App;
