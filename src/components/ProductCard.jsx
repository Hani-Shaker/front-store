// src/components/ProductCard.jsx
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { motion } from 'framer-motion';

const badgeStyles = {
  new: 'bg-badge-new text-primary-foreground',
  bestseller: 'bg-badge-bestseller text-accent-foreground',
  sale: 'bg-badge-sale text-primary-foreground',
};

const badgeLabels = {
  new: 'جديد',
  bestseller: 'الأكثر مبيعاً',
  sale: 'خصم',
};

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  // قيم افتراضية للـ properties المفقودة
  const colors = product.colors || ['#000'];
  const stock = product.stock || 0;
  const badge = product.badge || null;
  const originalPrice = product.originalPrice || null;

  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
        />
        {badge && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeStyles[badge] || 'bg-primary text-primary-foreground'}`}>
            {badgeLabels[badge]}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">{product.category || 'عام'}</span>
        <h3 className="text-sm font-bold text-card-foreground leading-tight line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          {colors.map((color, idx) => (
            <span key={idx} className="w-4 h-4 rounded-full border-2 border-border" style={{ backgroundColor: color }} />
          ))}
          {stock > 0 && <span className="text-[10px] text-muted-foreground mr-1">متاح: {stock}</span>}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-foreground">{product.price} ج.م</span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;