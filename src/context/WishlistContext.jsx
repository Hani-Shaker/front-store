import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const WishlistContext = createContext(undefined);
const KEY = 'Mero-wishlist-v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === product.id);
      // toast خارج الـ updater عشان StrictMode ما يكررهوش
      queueMicrotask(() => (exists ? toast.info('تم الحذف من المفضلة') : toast.success('تمت الإضافة للمفضلة ❤️')));
      return exists ? prev.filter((i) => i.id !== product.id) : [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((id) => items.some((i) => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
