import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatPrice, PLACEHOLDER_IMG } from '../lib/constants.js';

const badgeStyles = {
  new: 'bg-badge-new text-white',
  bestseller: 'bg-badge-bestseller text-accent-foreground',
  sale: 'bg-badge-sale text-white',
};
const badgeLabels = { new: 'جديد', bestseller: 'الأكثر مبيعاً', sale: 'خصم' };

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const { badge, originalPrice, colors, stock } = product;
  const discount = originalPrice && originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/products/${product.id}`} aria-label={product.name}>
          <img
            src={product.image || PLACEHOLDER_IMG}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }}
          />
        </Link>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-start">
          {badge && badgeLabels[badge] && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${badgeStyles[badge]}`}>{badgeLabels[badge]}</span>
          )}
          {discount > 0 && <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow">-{discount}%</span>}
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          aria-pressed={liked}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur grid place-items-center shadow hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </button>

        {stock > 0 && stock <= 3 && (
          <span className="absolute bottom-3 right-3 bg-foreground/80 text-background text-[10px] font-bold px-2.5 py-1 rounded-full">
            باقي {stock} فقط
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col gap-2 flex-1">
        <span className="text-[11px] font-bold text-primary">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-bold text-card-foreground leading-snug line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1.5">
          {colors.slice(0, 5).map((c, i) => (
            <span key={i} className="w-3.5 h-3.5 rounded-full border border-border ring-1 ring-card" style={{ backgroundColor: c }} title={c} />
          ))}
          {colors.length > 5 && <span className="text-[10px] text-muted-foreground">+{colors.length - 5}</span>}
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-extrabold text-foreground">{formatPrice(product.price)}</span>
            {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</span>}
          </div>
          <button
            onClick={() => addToCart(product)}
            aria-label={`أضف ${product.name} للسلة`}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:bg-primary/90 active:scale-90 transition"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
