import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { getProducts } from '../data/products.js';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getProducts();
      setProducts(allProducts);
      
      // استخدم أول 6 منتجات للـ featured section
      setFeaturedProducts(allProducts.slice(0, 6));
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Slider - مع المنتجات */}
      {products.length > 0 && <HeroSlider products={products} />}

      {/* المنتجات المميزة */}
      <section className="container mx-auto px-4 mt-16">
        <SectionTitle subtitle="اختر من أفضل المنتجات">⭐ المنتجات المميزة</SectionTitle>

        {loading && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">جاري تحميل المنتجات...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-lg text-destructive">{error}</p>
            <button 
              onClick={loadProducts}
              className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold"
            >
              حاول مرة أخرى
            </button>
          </div>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featuredProducts.map((product, i) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={{
                    id: product._id || product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category || 'عام',
                    stock: product.stock || 0,
                    colors: Array.isArray(product.colors) && product.colors.length > 0 
                      ? product.colors 
                      : ['#000000'],
                    originalPrice: product.originalPrice || null,
                    badge: product.badge || null
                  }} 
                  index={i} 
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                عرض جميع المنتجات
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-4">لا توجد منتجات حالياً</p>
            <Link 
              to="/products" 
              className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold"
            >
              تصفح المنتجات
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
