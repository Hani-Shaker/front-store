import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatPrice } from '../../lib/constants.js';

const navLinks = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/products', label: 'المنتجات' },
  { to: '/contact', label: 'اتصل بنا' },
];

const Badge = ({ n, className = '' }) =>
  n > 0 ? (
    <span className={`absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold grid place-items-center ${className}`}>
      {n}
    </span>
  ) : null;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const { items: wishlist } = useWishlist();
  const { storeName } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const linkCls = ({ isActive }) =>
    `relative text-sm font-bold py-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-xl border-b border-border shadow-nav">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-gradient-hero grid place-items-center shadow-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-foreground">{storeName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="التنقل الرئيسي">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <motion.span layoutId="nav-underline" className="absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-primary" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/wishlist" aria-label="المفضلة" className="relative p-2.5 rounded-full hover:bg-muted transition-colors">
            <Heart className={`w-5 h-5 ${wishlist.length ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
            <Badge n={wishlist.length} className="bg-destructive text-destructive-foreground" />
          </Link>

          <Link to="/cart" aria-label="السلة" className="relative flex items-center gap-2 py-2 px-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold">{totalItems}</span>
            {totalPrice > 0 && <span className="hidden sm:inline text-xs font-medium border-r border-primary-foreground/30 pr-2">{formatPrice(totalPrice)}</span>}
          </Link>

          <button className="md:hidden p-2.5 rounded-full hover:bg-muted transition-colors" onClick={() => setOpen((o) => !o)} aria-label="القائمة" aria-expanded={open}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-t border-border"
          >
            <div className="flex flex-col p-3 gap-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => `text-sm font-bold py-3 px-4 rounded-xl transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
