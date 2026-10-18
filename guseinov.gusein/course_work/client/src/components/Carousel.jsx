import { useMemo, useState } from "react";
import ProductCard from "./ProductCard.jsx";

export default function Carousel({ items, onOpen }) {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const max = Math.max(0, items.length - visible);
  const slice = useMemo(() => {
    if (!items.length) return [];
    const start = index % items.length;
    const doubled = [...items, ...items];
    return doubled.slice(start, start + visible);
  }, [index, items]);

  if (!items.length) return null;

  function prev() {
    setIndex((current) => (current - 1 + items.length) % items.length);
  }

  function next() {
    setIndex((current) => (current + 1) % items.length);
  }

  return (
    <div className="carousel">
      <button type="button" className="carousel__arrow" onClick={prev} aria-label="Назад" disabled={max === 0}>
        ‹
      </button>
      <div className="carousel__track">
        {slice.map((product) => (
          <ProductCard key={`${product.id}-${index}`} product={product} onOpen={onOpen} variant="slider" />
        ))}
      </div>
      <button type="button" className="carousel__arrow" onClick={next} aria-label="Вперёд" disabled={max === 0}>
        ›
      </button>
    </div>
  );
}
