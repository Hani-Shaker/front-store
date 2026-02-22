import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { getProducts, categories } from '../data/products.js';
import { Search } from 'lucide-react';

const PAGE_SIZE = 9;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // جلب المنتجات عند تحميل الصفحة
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('فشل تحميل المنتجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'الكل') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    }
    return list;
  }, [search, category, products]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (loading) {
    return (
      <Layout>
        <section className="container mx-auto px-4 mt-8 text-center py-20">
          <p className="text-lg text-muted-foreground">جاري تحميل المنتجات...</p>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="container mx-auto px-4 mt-8 text-center py-20">
          <p className="text-lg text-destructive">{error}</p>
          <button 
            onClick={loadProducts}
            className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold"
          >
            حاول مرة أخرى
          </button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8">
        <SectionTitle subtitle={`${filtered.length} منتج`}>🛍️ المنتجات</SectionTitle>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setVisibleCount(PAGE_SIZE); }}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                  category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visible.map((product, i) => (
              <ProductCard 
                key={product._id || product.id} 
                product={{
                  id: product._id || product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category || 'عام'
                }} 
                index={i} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">لا توجد منتجات مطابقة</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              عرض المزيد ({filtered.length - visibleCount} متبقي)
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Products;