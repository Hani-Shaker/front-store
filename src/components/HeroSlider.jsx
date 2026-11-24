import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPrice, PLACEHOLDER_IMG, optimize } from '../lib/constants.js';

const HeroSlider = ({ products = [] }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const { addToCart } = useCart();
  const { storeName, tagline } = useSettings();
  const n = products.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % Math.max(n, 1)), [n]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + Math.max(n, 1)) % Math.max(n, 1)), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [n, paused, next]);

  const product = products[current];

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl pointer-events-none" />

      <div className="relative grid md:grid-cols-2 items-center gap-6 px-6 sm:px-12 py-10 md:py-14 min-h-[420px]">
        <div className="text-center md:text-right order-2 md:order-1">
          <span className="inline-block text-xs font-bold bg-primary-foreground/15 rounded-full px-3 py-1 mb-4">
            ✨ {storeName}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={product?.id || 'welcome'}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3 line-clamp-2">
                {product ? product.name : 'مرحباً بك في متجرنا'}
              </h1>
              <p className="text-base opacity-85 mb-6">
                {product ? (
                  <>بسعر <b className="text-accent text-xl">{formatPrice(product.price)}</b></>
                ) : tagline}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {product && !product.pickImage && (
                  <button onClick={() => addToCart(product)} className="btn bg-accent text-accent-foreground hover:opacity-90 px-6 py-3 shadow-lg">
                    أضف للسلة
                  </button>
                )}
                <Link to={product ? `/products/${product.id}` : '/products'} className="btn bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground px-6 py-3">
                  {product ? 'التفاصيل' : 'تسوّق الآن'} <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {product && (
          <div className="order-1 md:order-2 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={product.id}
                src={optimize(product.image, 800) || PLACEHOLDER_IMG}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4 }}
                className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-cover rounded-3xl shadow-2xl border-4 border-primary-foreground/20"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }}
              />
            </AnimatePresence>
          </div>
        )}
      </div>

      {n > 1 && (
        <>
          <button onClick={prev} aria-label="السابق" className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/30 backdrop-blur place-items-center transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="التالي" className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/30 backdrop-blur place-items-center transition">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {products.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`الشريحة ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === current ? 'bg-accent w-6' : 'bg-primary-foreground/40 w-2'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
