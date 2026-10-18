import { formatPrice } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useGuestPrompt } from "../context/GuestPrompt.jsx";
import Quantity from "./Quantity.jsx";
import Stars from "./Stars.jsx";

export default function ProductModal({ product, onClose }) {
  const cart = useCart();
  const { requireUser } = useGuestPrompt();
  if (!product) return null;
  const quantity = cart.qty(product.id);

  return (
    <div className="product-modal">
      <div className="product-modal__media">
        <img src={product.image} alt={product.name} />
      </div>
      <div>
        <h2>{product.name}</h2>
        <Stars value={product.rating} />
        <p className="product-modal__desc">{product.description}</p>
        <h3>Характеристики</h3>
        <dl className="specs">
          {product.specs.map((spec) => (
            <div key={spec.name} className="specs__row">
              <dt>{spec.name}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        <p className="product-modal__price">{formatPrice(product.price)}</p>
        {quantity === 0 ? (
          <button type="button" className="btn" onClick={() => requireUser(() => cart.add(product))}>
            <img src="/images/icons/card.svg" alt="" className="btn__icon" />
            В корзину
          </button>
        ) : (
          <div className="card__qty-row">
            <Quantity value={quantity} onChange={(next) => cart.setQuantity(product.id, next)} />
            <span className="muted">В корзине {quantity} шт.</span>
          </div>
        )}
      </div>
    </div>
  );
}
