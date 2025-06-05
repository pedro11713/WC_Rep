import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from './CartContext';
import { Link } from 'react-router-dom';
import '../../styles/CartStyle.css'; // O seu ficheiro CSS

// Componente para o carrossel de produtos (pode colocar num ficheiro separado se quiser)
const ProductCarousel = ({ title, products }) => (
    <div className="suggested-section">
        <h2>{title}</h2>
        <div className="product-carousel">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <Link to={`/products/${product.id}`}>
                        <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} />
                        <p>{product.name}</p>
                    </Link>
                </div>
            ))}
        </div>
    </div>
);


const CartContent = () => {
    // 1. Obter os itens e funções do contexto
    const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);

    // Estado para os produtos sugeridos
    const [topProducts, setTopProducts] = useState([]);

    // 2. Calcular o subtotal
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // 3. Carregar os produtos sugeridos (Top Produtos)
    useEffect(() => {
        async function fetchTopProducts() {
            try {
                // Usando o seu endpoint de produtos em destaque
                const res = await fetch('http://127.0.0.1:5000/api/v1/products/featured');
                if (res.ok) {
                    const data = await res.json();
                    setTopProducts(data);
                }
            } catch (error) {
                console.error("Erro ao carregar top produtos:", error);
            }
        }
        fetchTopProducts();
    }, []);

    // Lógica para quando o carrinho está vazio
    if (cartItems.length === 0) {
        return (
            <div className="cart-page empty-cart">
                <header className="cart-header">
                    <h1>Shopping Bag</h1>
                </header>
                <p>O seu carrinho está vazio.</p>
                <Link to="/produtos" className="checkout-button">Continuar a comprar</Link>
                <div className="suggested-products">
                    <ProductCarousel title="Top Produtos (Por Avaliação Média)" products={topProducts} />
                </div>
            </div>
        );
    }

    // 4. Renderizar o carrinho com os itens e o JSX correto
    return (
        <div className="cart-page">
            <header className="cart-header">
                <h1>Shopping Bag</h1>
            </header>

            <main className="cart-main">
                <div className="cart-items">
                    {/* Aqui vai a lista de itens */}
                    {cartItems.map(item => (
                        <div key={`${item.productId}-${item.size}-${item.color}`} className="cart-item">
                           <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
                           <div className="item-details">
                               <h3>{item.name}</h3>
                               <p>Size: {item.size} | Color: {item.color}</p>
                               <p>{item.price.toFixed(2)}€</p>
                               <div className="quantity-selector">
                                   <button onClick={() => updateQuantity({ productId: item.productId, size: item.size, color: item.color }, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                   <span>{item.quantity}</span>
                                   <button onClick={() => updateQuantity({ productId: item.productId, size: item.size, color: item.color }, item.quantity + 1)}>+</button>
                               </div>
                               <button onClick={() => removeFromCart({ productId: item.productId, size: item.size, color: item.color })} className="remove-button">Remover</button>
                           </div>
                           <div className="item-total">
                                <p>{(item.price * item.quantity).toFixed(2)}€</p>
                           </div>
                        </div>
                    ))}
                </div>

                <aside className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="summary-row">
                        <span>Estimated Shipping</span>
                        <span>To be calculated</span>
                    </div>
                    <div className="summary-row">
                        <span>Estimated Tax</span>
                        <span>To be calculated</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <button className="checkout-button">Checkout now</button>
                    <Link to="/produtos" className="back-button">Back to shopping</Link>
                </aside>
            </main>

            <footer className="suggested-products">
                <ProductCarousel title="Top Produtos (Por Avaliação Média)" products={topProducts} />
            </footer>
        </div>
    );
};

export default CartContent;