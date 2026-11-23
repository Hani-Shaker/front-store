import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext(undefined);
const KEY = 'lola-cart-v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  // المفتاح = المنتج + اللون، فنفس المنتج بلونين = سطرين
  const addToCart = useCallback((product, color, qty = 1) => {
    const selectedColor = color || product.colors?.[0] || '#000000';
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.selectedColor === selectedColor);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { product, quantity: qty, selectedColor }];
    });
    toast.success('تمت الإضافة إلى السلة 🛒');
  }, []);

  const removeFromCart = useCallback((productId, color) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.selectedColor === color)));
    toast.info('تم الحذف من السلة');
  }, []);

  const updateQuantity = useCallback((productId, color, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !(i.product.id === productId && i.selectedColor === color))
        : prev.map((i) => (i.product.id === productId && i.selectedColor === color ? { ...i, quantity: Math.min(quantity, 99) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
