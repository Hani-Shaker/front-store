import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext(undefined);
const KEY = 'Mero-cart-v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  // المفتاح = المنتج + اللون + الصورة المختارة، فنفس المنتج بتصميمين = سطرين
  const same = (i, id, color, image) =>
    i.product.id === id && (i.selectedColor ?? null) === (color ?? null) && (i.selectedImage ?? null) === (image ?? null);

  const addToCart = useCallback((product, color, qty = 1, image = null, imageIndex = null) => {
    const selectedColor = color || product.colors?.[0] || null; // null = منتج من غير ألوان
    setItems((prev) => {
      const existing = prev.find((i) => same(i, product.id, selectedColor, image));
      if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { product, quantity: qty, selectedColor, selectedImage: image, selectedImageIndex: imageIndex }];
    });
    toast.success('تمت الإضافة إلى السلة 🛒');
  }, []);

  const removeFromCart = useCallback((productId, color, image = null) => {
    setItems((prev) => prev.filter((i) => !same(i, productId, color, image)));
    toast.info('تم الحذف من السلة');
  }, []);

  const updateQuantity = useCallback((productId, color, quantity, image = null) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !same(i, productId, color, image))
        : prev.map((i) => (same(i, productId, color, image) ? { ...i, quantity: Math.min(quantity, 99) } : i))
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
