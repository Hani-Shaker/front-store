// src/pages/Index.jsx
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { getProducts, getDiscountedProducts } from '../data/products.js';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [products, setProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getProducts();
      setProducts(allProducts);
      
      // استخدم أول 6 منتجات للـ featured section
      setDiscountedProducts(allProducts.slice(0, 6));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Pass products to HeroSlider */}
      <HeroSlider products={products.length > 0 ? products : []} />

      <section className="container mx-auto px-4 mt-16">
        <SectionTitle subtitle="اختر من أفضل المنتجات">⭐ المنتجات المميزة</SectionTitle>

        {loading ? (
          <p className="text-center py-20 text-muted-foreground">جاري التحميل...</p>
        ) : discountedProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {discountedProducts.map((product, i) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={{
                    id: product._id || product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category || 'عام',
                    stock: product.stock || 0,
                    colors: ['#000'], // لون افتراضي
                    originalPrice: null,
                    badge: null
                  }} 
                  index={i} 
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
                عرض جميع المنتجات
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>لا توجد منتجات حالياً</p>
            <Link to="/products" className="inline-block mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground">
              تصفح المنتجات
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;