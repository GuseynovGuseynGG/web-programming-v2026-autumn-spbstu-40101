import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gadget-hub-cart";
const CartContext = createContext(null);

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    function qty(id) {
      return items.find((item) => item.id === id)?.quantity ?? 0;
    }

    function add(product) {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        if (existing) {
          return current.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [
          ...current,
          { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 },
        ];
      });
    }

    function setQuantity(id, quantity) {
      setItems((current) => {
        if (quantity <= 0) return current.filter((item) => item.id !== id);
        return current.map((item) => (item.id === id ? { ...item, quantity } : item));
      });
    }

    function remove(ids) {
      const set = new Set(ids);
      setItems((current) => current.filter((item) => !set.has(item.id)));
    }

    function clear() {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
    }

    return { items, count, total, qty, add, setQuantity, remove, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
