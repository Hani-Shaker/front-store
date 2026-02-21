import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        toast.info('تم الحذف من المفضلة');
        return prev.filter((i) => i.id !== product.id);
      }
      toast.success('تمت الإضافة للمفضلة ❤️');
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId) => items.some((i) => i.id === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
