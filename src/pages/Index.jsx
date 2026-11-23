import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck, Headphones, Gift } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductSkeleton from '../components/ProductSkeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { CATEGORY_ICONS, formatPrice } from '../lib/constants.js';

const ViewAll = ({ to = '/products' }) => (
  <Link to={to} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">
    عرض الكل <ArrowLeft className="w-4 h-4" />
  </Link>
);

const Index = () => {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const { deliveryFee, freeShippingThreshold } = useSettings();

  const { hero, newest, onSale, categories } = useMemo(() => {
    const byDate = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const counts = {};
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return {
      hero: byDate.filter((p) => p.image).slice(0, 5),
      newest: byDate.slice(0, 8),
      onSale: byDate.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4),
      categories: Object.entries(counts).sort((a, b) => b[1] - a[1]),
    };
  }, [products]);

  const features = [
    { Icon: Truck, title: 'توصيل داخل الفيوم فقط', text: freeShippingThreshold > 0 ? `شحن مجاني فوق ${formatPrice(freeShippingThreshold)}` : `رسوم التوصيل ${formatPrice(deliveryFee)}` },
    { Icon: ShieldCheck, title: 'الدفع عند الاستلام', text: 'ادفع بعد ما تستلم طلبك' },
    { Icon: Gift, title: 'منتجات مختارة', text: 'جودة عالية وأسعار مناسبة' },
    { Icon: Headphones, title: 'دعم سريع', text: 'تواصل معنا واتساب أو تليفون' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-5">
        <HeroSlider products={hero} />
      </div>

      {/* مميزات */}
      <section className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3.5 shadow-card">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="w-5 h-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الأقسام */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 mt-14">
          <SectionTitle subtitle="اختار القسم اللي يناسبك">تسوّق حسب القسم</SectionTitle>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {categories.map(([cat, count]) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="shrink-0 w-32 sm:w-40 bg-card border border-border rounded-2xl p-4 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/40 transition-all"
              >
                <div className="text-3xl mb-2">{CATEGORY_ICONS[cat] || '🛍️'}</div>
                <p className="text-sm font-bold text-foreground">{cat}</p>
                <p className="text-xs text-muted-foreground">{count} منتج</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* وصل حديثاً */}
      <section className="container mx-auto px-4 mt-14">
        <SectionTitle subtitle="أحدث ما وصلنا" action={<ViewAll />}>وصل حديثاً</SectionTitle>
        {isLoading && <ProductSkeleton count={8} />}
        {isError && <ErrorState message="فشل تحميل المنتجات" onRetry={refetch} />}
        {!isLoading && !isError && newest.length > 0 && <ProductGrid products={newest} />}
        {!isLoading && !isError && newest.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">لا توجد منتجات حالياً</div>
        )}
        {newest.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/products" className="btn-primary px-8 py-3">عرض جميع المنتجات <ArrowLeft className="w-4 h-4" /></Link>
          </div>
        )}
      </section>

      {/* العروض */}
      {onSale.length > 0 && (
        <section className="container mx-auto px-4 mt-16">
          <div className="rounded-3xl bg-secondary border border-border p-5 sm:p-8">
            <SectionTitle subtitle="خصومات لفترة محدودة">🔥 عروض وخصومات</SectionTitle>
            <ProductGrid products={onSale} />
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
