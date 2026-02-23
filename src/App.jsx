import { useState } from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import Index from './pages/Index.jsx';
import Products from './pages/Products.jsx';
import Contact from './pages/Contact.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import NotFound from './pages/NotFound.jsx';
// import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
// import AdminLogin from './pages/Admin/AdminLogin.jsx';

const queryClient = new QueryClient();

const App = () => {
  // const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
  //   localStorage.getItem('adminToken') === 'authenticated'
  // );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <Toaster position="top-center" richColors />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              
              {/* Admin Routes */}
              {/* <Route 
                path="/admin" 
                element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} 
              />
              <Route 
                path="/admin-dashboard" 
                element={isAdminLoggedIn ? <AdminDashboard /> : <Navigate to="/admin" />} 
              /> */}
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
