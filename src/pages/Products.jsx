import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SearchX } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductSkeleton from '../components/ProductSkeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useProducts } from '../hooks/useProducts.js';

const PAGE_SIZE = 12;
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: الأقل أولاً' },
  { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
  { value: 'discount', label: 'الأعلى خصماً' },
];

const discountOf = (p) => (p.originalPrice > p.price ? (p.originalPrice - p.price) / p.originalPrice : 0);

const Products = () => {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const [params, setParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const category = params.get('category') || 'الكل';
  const search = params.get('q') || '';
  const sort = params.get('sort') || 'newest';

  const setParam = (key, value, def) => {
    const next = new URLSearchParams(params);
    if (!value || value === def) next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  const categories = useMemo(() => ['الكل', ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'الكل') list = list.filter((p) => p.category === category);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'discount') sorted.sort((a, b) => discountOf(b) - discountOf(a));
    else sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return sorted;
  }, [products, category, search, sort]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8">
        <SectionTitle subtitle={isLoading ? 'جاري التحميل...' : `${filtered.length} منتج`}>المنتجات</SectionTitle>

        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/90 backdrop-blur border-b border-border/60 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="ابحث عن منتج..."
                aria-label="بحث"
                className="field pr-10"
              />
              {search && (
                <button onClick={() => setParam('q', '')} aria-label="مسح البحث" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value, 'newest')} aria-label="الترتيب" className="field sm:w-52">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setParam('category', cat, 'الكل')}
                aria-pressed={category === cat}
                className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition ${category === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <ProductSkeleton count={8} />}
        {isError && <ErrorState message="فشل تحميل المنتجات" onRetry={refetch} />}

        {!isLoading && !isError && (
          visible.length > 0 ? (
            <>
              <ProductGrid products={visible} />
              {visibleCount < filtered.length && (
                <div className="text-center mt-10">
                  <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn-outline px-8 py-3">
                    عرض المزيد ({filtered.length - visibleCount} متبقي)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <SearchX className="w-12 h-12 mx-auto mb-3" />
              <p className="text-lg font-bold text-foreground">لا توجد منتجات مطابقة</p>
              <button onClick={() => setParams({}, { replace: true })} className="btn-outline mt-4">مسح الفلاتر</button>
            </div>
          )
        )}
      </section>
    </Layout>
  );
};

export default Products;
