import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'الرئيسية' },
  { to: '/products', label: 'المنتجات' },
  { to: '/contact', label: 'اتصل بنا' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const { items: wishlistItems } = useWishlist();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl shadow-nav border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            أناقة ستور
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                location.pathname === link.to ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.div layoutId="nav-underline" className="absolute -bottom-0.5 right-0 left-0 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs font-bold">{totalItems}</span>
            {totalPrice > 0 && (
              <span className="hidden sm:inline text-xs font-medium border-r border-primary-foreground/30 pr-1.5 mr-0.5">
                {totalPrice} ج.م
              </span>
            )}
          </Link>

          <button className="md:hidden p-2 rounded-full hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-b border-border"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-semibold py-2 px-4 rounded-lg transition-colors ${
                    location.pathname === link.to ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
