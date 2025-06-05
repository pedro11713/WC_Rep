import React, { useEffect, useState, useContext } from "react";
import '../../styles/CartStyle.css';
import CartItem from './CartItem';
import { CartContext } from './CartContext';
import TopProducts from '../PagInicial/TopProducts';
import { useNavigate } from "react-router-dom";





function CartContent() {
    // Estado local para carrinho vindo da BD
  const [dbCartItems, setDbCartItems] = useState([]);
  const { cartItems, updateQuantity, removeItem, clearCart } = useContext(CartContext);
  console.log("CARRINHO:", cartItems);

    const subtotal = dbCartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);




  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/products/cart");
        const data = await response.json();
        setDbCartItems(data.items || []);
      } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
      }
    }

    fetchCart();
  }, []);

  async function handleRemoveItem(productId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/v1/cart/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "guest",  // se tiveres login usa o id real
        productId: productId,
      }),
    });

    if (response.ok) {
      // Atualiza visualmente os items
      setDbCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } else {
      alert("Erro ao remover item.");
    }
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    alert("Erro de conexão.");
  }
}

 async function handleUpdateQuantity(productId, newQuantity) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/v1/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "guest",
        productId: productId,
        quantity: newQuantity,
      }),
    });

    if (response.ok) {
      // Atualize localmente seu estado (dbCartItems ou cartItems)
      setDbCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      const errorData = await response.json();
      console.error("Erro do backend:", errorData);
      alert("Erro ao atualizar quantidade: " + (errorData.error || "Erro desconhecido"));
    }
  } catch (err) {
    console.error("Erro ao atualizar quantidade:", err);
    alert("Erro de conexão.");
  }
}


  const navigate = useNavigate();
  async function handleCheckout() {
  if (dbCartItems.length === 0) {
    alert("O carrinho está vazio!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/api/v1/products/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: dbCartItems }),
    });

    if (response.ok) {
      const data = await response.json();
      alert("Carrinho guardado com sucesso! ID: " + data.id);

      setDbCartItems([]);
      clearCart();

      navigate("/success");
    } else {
      const error = await response.json();
      alert("Erro ao guardar carrinho: " + error.message);
    }
  } catch (err) {
    console.error("Erro no checkout:", err);
    alert("Erro ao conectar ao servidor.");
  }
}



  return (
    <div className="cart-page">
      <main className="cart-main">
        <section className="cart-items">
          <h2>Shopping Bag</h2>
            {dbCartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={(newQuantity) => handleUpdateQuantity(item.productId, newQuantity)}
                onRemove={() => handleRemoveItem(item.productId)}
              />
            ))}
        </section>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Shipping:</span>
            <span>To be calculated</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax:</span>
            <span>To be calculated</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={dbCartItems.length === 0}
          >
            Checkout now
          </button>

          <button className="back-button" onClick={() => navigate("/")}>
            Back to shopping
          </button>

        </aside>
      </main>

      <section className="suggested-products">
        <div className="suggested-section">
          <h3>Trending</h3>
          <div className="product-carousel">
            <TopProducts />
          </div>
        </div>
      </section>
    </div>
  );
}

export default CartContent;
