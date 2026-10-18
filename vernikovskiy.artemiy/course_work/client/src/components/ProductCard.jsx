import { formatPrice } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useGuestPrompt } from "../context/GuestPrompt.jsx";
import Quantity from "./Quantity.jsx";
import Stars from "./Stars.jsx";

export default function ProductCard({ product, onOpen, variant = "catalog" }) {
  const cart = useCart();
  const { requireUser } = useGuestPrompt();
  const quantity = cart.qty(product.id);

  return (
    <article className={`card card--${variant}`} onClick={() => onOpen?.(product)}>
      <div className="card__media">
        <img src={product.image} alt={product.name} />
        <div className="card__labels">
          {product.isNew ? <span className="label label--new">Новинка</span> : null}
          {product.isHit ? <span className="label label--hit">Хит</span> : null}
        </div>
      </div>
      <div className="card__body">
        <p className="card__price">{formatPrice(product.price)}</p>
        <p className="card__name">{product.name}</p>
        <Stars value={product.rating} />
        {variant === "catalog" ? (
          <div className="card__action" onClick={(event) => event.stopPropagation()}>
            {quantity === 0 ? (
              <button type="button" className="btn" onClick={() => requireUser(() => cart.add(product))}>
                <img src="/images/icons/card.svg" alt="" className="btn__icon" />
                В корзину
              </button>
            ) : (
              <div className="card__qty-row">
                <button type="button" className="btn btn--pink">
                  {quantity} шт.
                </button>
                <Quantity value={quantity} onChange={(next) => cart.setQuantity(product.id, next)} />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
