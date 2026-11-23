import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Index from './pages/Index.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Contact from './pages/Contact.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import NotFound from './pages/NotFound.jsx';

// لوحة التحكم في chunk منفصل عشان ما تتقلش على الزوار
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel.jsx'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <CartProvider>
        <WishlistProvider>
          <Toaster position="top-center" richColors dir="rtl" toastOptions={{ style: { fontFamily: 'Cairo, sans-serif' } }} />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">جاري التحميل...</div>}>
                    <AdminPanel />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
