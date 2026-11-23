import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, Truck } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { productService } from '../services/productService.js';
import { formatPrice, normalizeProduct, PLACEHOLDER_IMG } from '../lib/constants.js';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { data: all = [] } = useProducts();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => normalizeProduct(await productService.getById(id)),
  });

  const related = useMemo(
    () => all.filter((p) => data && p.id !== data.id && p.category === data.category).slice(0, 4),
    [all, data]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 mt-8 grid md:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-4"><div className="skeleton h-4 w-24" /><div className="skeleton h-9 w-3/4" /><div className="skeleton h-7 w-40" /><div className="skeleton h-24 w-full" /></div>
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <ErrorState message={error?.status === 404 || error?.status === 400 ? 'المنتج غير موجود' : 'فشل تحميل المنتج'} onRetry={error?.status === 404 ? undefined : refetch} />
        <div className="text-center -mt-10 mb-10"><Link to="/products" className="btn-outline">العودة للمنتجات</Link></div>
      </Layout>
    );
  }

  const selected = color || data.colors[0];
  const liked = isInWishlist(data.id);
  const discount = data.originalPrice > data.price ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : 0;

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5" aria-label="مسار التنقل">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link><ChevronLeft className="w-3 h-3" />
          <Link to="/products" className="hover:text-foreground">المنتجات</Link><ChevronLeft className="w-3 h-3" />
          <span className="text-foreground font-semibold truncate">{data.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-card">
            <img src={data.image || PLACEHOLDER_IMG} alt={data.name} className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
            {discount > 0 && <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow">وفّر {discount}%</span>}
          </div>

          <div className="flex flex-col">
            <Link to={`/products?category=${encodeURIComponent(data.category)}`} className="text-xs font-bold text-primary w-fit">{data.category}</Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 leading-snug">{data.name}</h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-black text-primary">{formatPrice(data.price)}</span>
              {discount > 0 && <span className="text-base text-muted-foreground line-through">{formatPrice(data.originalPrice)}</span>}
            </div>

            {data.description && <p className="text-sm text-muted-foreground leading-loose mt-5 whitespace-pre-line">{data.description}</p>}

            <div className="mt-6">
              <p className="text-sm font-bold mb-2">اللون</p>
              <div className="flex flex-wrap gap-2.5">
                {data.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} aria-label={`اللون ${c}`} aria-pressed={selected === c}
                    className={`w-9 h-9 rounded-full border-2 transition ${selected === c ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold mb-2">الكمية</p>
              <div className="inline-flex items-center rounded-xl border border-border bg-card">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="تقليل" className="w-11 h-11 grid place-items-center hover:bg-muted rounded-s-xl"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="زيادة" className="w-11 h-11 grid place-items-center hover:bg-muted rounded-e-xl"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => addToCart(data, selected, qty)} className="btn-primary flex-1 py-3.5 text-base">
                <ShoppingBag className="w-5 h-5" /> أضف للسلة
              </button>
              <button onClick={() => toggleWishlist(data)} aria-label="المفضلة" aria-pressed={liked} className="btn-outline w-14 !px-0">
                <Heart className={`w-5 h-5 ${liked ? 'fill-destructive text-destructive' : ''}`} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl p-3">
              <Truck className="w-4 h-4 shrink-0" /> التوصيل لكل المحافظات والدفع عند الاستلام
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-extrabold mb-5">منتجات مشابهة</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ProductDetails;
