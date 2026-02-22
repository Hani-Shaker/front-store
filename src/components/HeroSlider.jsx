// src/components/HeroSlider.jsx
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSlider = ({ products = [] }) => {
  const [current, setCurrent] = useState(0);
  const { addToCart } = useCart();

  const next = useCallback(() => {
    if (products.length === 0) return;
    setCurrent((c) => (c + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    if (products.length === 0) return;
    setCurrent((c) => (c - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, products.length]);

  // إذا لم تكن هناك منتجات، لا تظهر شيء
  if (!products || products.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/50 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center min-h-[360px] md:min-h-[420px] gap-6 py-8">
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">مرحباً بك في متجرنا</h2>
              <p className="text-lg mb-4 opacity-90">اكتشف أفضل المنتجات معنا</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const product = products[current];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/50 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center min-h-[360px] md:min-h-[420px] gap-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id || product._id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="flex-1 text-center md:text-right"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{product.name}</h2>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <span className="text-3xl font-black">{product.price} ج.م</span>
              </div>
              <button
                onClick={() => addToCart({
                  id: product._id || product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category || 'عام',
                  colors: ['#000'],
                  stock: product.stock || 0
                })}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95"
              >
                أضف للسلة
              </button>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={(product.id || product._id) + '-img'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex-shrink-0"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-60 h-60 md:w-72 md:h-72 object-cover rounded-2xl shadow-2xl"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/30 transition">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/30 transition">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-accent w-6' : 'bg-primary-foreground/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;