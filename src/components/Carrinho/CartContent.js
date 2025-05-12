import React, { useContext } from 'react';
import '../../styles/CartStyle.css';
import CartItem from './CartItem';
import { CartContext } from './CartContext';
import TopProducts from '../PagInicial/TopProducts';


function CartContent() {
  const { cartItems, updateQuantity, removeItem } = useContext(CartContext);
  console.log("CARRINHO:", cartItems);

  const subtotal = cartItems.reduce(function (total, item) {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <div className="cart-page">
      <main className="cart-main">
        <section className="cart-items">
          <h2>Shopping Bag</h2>
          {cartItems.map(function (item) {
            return (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            );
          })}
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
          <button className="checkout-button">Checkout now</button>
          <button className="back-button">Back to shopping</button>
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
