import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'phone_shop_cart_v1';

// Cart items are keyed by `${productId}::${colorName || 'none'}` so the same
// product with different colors are separate lines.
function itemKey(productId, colorName) {
  return `${productId}::${colorName || 'none'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, colorName, quantity = 1) {
    const key = itemKey(product.id, colorName);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      const unitPrice = product.promotionPrice ?? product.price;
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url || null,
          unitPrice,
          colorName: colorName || null,
          quantity,
          maxStock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(key, quantity) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) } : i))
    );
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
