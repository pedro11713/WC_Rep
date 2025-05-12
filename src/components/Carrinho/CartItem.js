import React, { useContext } from 'react';
import { FavoriteContext } from '../Favoritos/FavoriteContext';
import '../../styles/CartItem.css';

function CartItem(props) {
  const item = props.item;
  const { addToFavorites } = useContext(FavoriteContext);

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} className="item-image" />
      <div className="item-details">
        <h3>{item.name}</h3>
        <p className="item-description">
          Size: {item.size} | Color: {item.color}
        </p>

        <div className="item-quantity">
          <button
            onClick={function () {
              props.onUpdateQuantity(item.id, item.quantity - 1);
            }}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={function () {
              props.onUpdateQuantity(item.id, item.quantity + 1);
            }}
          >
            +
          </button>
        </div>

        <div className="item-actions">

          <button
            className="remove-button"
            onClick={function () {
              props.onRemove(item.id);
            }}
          >
            Remove
          </button>
        </div>
      </div>
      <p className="item-price">€{(item.price * item.quantity).toFixed(2)}</p>
    </div>
  );
}

export default CartItem;