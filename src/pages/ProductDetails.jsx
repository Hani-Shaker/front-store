import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Truck, Check } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { productService } from '../services/productService.js';
import { formatPrice, normalizeProduct, PLACEHOLDER_IMG, getImages, optimize } from '../lib/constants.js';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { data: all = [] } = useProducts();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(null);
  const [idx, setIdx] = useState(0);
  const [manual, setManual] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => normalizeProduct(await productService.getById(id)),
  });

  const related = useMemo(
    () => all.filter((p) => data && p.id !== data.id && p.category === data.category).slice(0, 4),
    [all, data]
  );

  const selected = color || data?.colors?.[0] || null;
  const images = data ? getImages(data, selected) : [];

  // لما اللون يتغير نرجع لأول صورة
  useEffect(() => { setIdx(0); }, [selected, data?.id]);

  // تقليب تلقائي لحد ما العميل يتحكم بنفسه
  useEffect(() => {
    if (images.length < 2 || manual || data?.pickImage) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length, manual, data?.pickImage]);

  const go = (i) => { setManual(true); setIdx((i + images.length) % images.length); };

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
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border shadow-card">
              {(images.length ? images : [PLACEHOLDER_IMG]).map((src, i) => (
                <img key={src + i} src={src === PLACEHOLDER_IMG ? src : optimize(src, 1000)} alt={i === idx ? data.name : ''}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
              ))}
              {discount > 0 && <span className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow">وفّر {discount}%</span>}
              {images.length > 1 && (
                <>
                  <button onClick={() => go(idx + 1)} aria-label="التالي" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur grid place-items-center shadow"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => go(idx - 1)} aria-label="السابق" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur grid place-items-center shadow"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
            </div>
            {images.length > 1 && (
              data.pickImage ? (
                <div className="mt-4">
                  <p className="text-sm font-bold mb-2">اختر الصورة / التصميم اللي عايزه <span className="text-muted-foreground font-normal">(مختار: رقم {idx + 1})</span></p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="اختيار التصميم">
                    {images.map((src, i) => (
                      <button key={src + i} type="button" role="radio" aria-checked={i === idx} onClick={() => go(i)} aria-label={`التصميم ${i + 1}`}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${i === idx ? 'border-primary ring-2 ring-primary/30' : 'border-border opacity-80 hover:opacity-100'}`}>
                        <img src={optimize(src, 220)} alt="" className="w-full h-full object-cover" />
                        <span className={`absolute top-1 right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold grid place-items-center ${i === idx ? 'bg-primary text-primary-foreground' : 'bg-card/90 text-foreground'}`}>
                          {i === idx ? <Check className="w-3 h-3" /> : i + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                  {images.map((src, i) => (
                    <button key={src + i} onClick={() => go(i)} aria-label={`صورة ${i + 1}`} aria-current={i === idx}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={optimize(src, 160)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="flex flex-col">
            <Link to={`/products?category=${encodeURIComponent(data.category)}`} className="text-xs font-bold text-primary w-fit">{data.category}</Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 leading-snug">{data.name}</h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-black text-primary">{formatPrice(data.price)}</span>
              {discount > 0 && <span className="text-base text-muted-foreground line-through">{formatPrice(data.originalPrice)}</span>}
            </div>

            {data.description && <p className="text-sm text-muted-foreground leading-loose mt-5 whitespace-pre-line">{data.description}</p>}

            {data.colors.length > 0 && (
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
            )}

            <div className="mt-6">
              <p className="text-sm font-bold mb-2">الكمية</p>
              <div className="inline-flex items-center rounded-xl border border-border bg-card">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="تقليل" className="w-11 h-11 grid place-items-center hover:bg-muted rounded-s-xl"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="زيادة" className="w-11 h-11 grid place-items-center hover:bg-muted rounded-e-xl"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => (data.pickImage ? addToCart(data, selected, qty, images[idx], idx + 1) : addToCart(data, selected, qty))} className="btn-primary flex-1 py-3.5 text-base">
                <ShoppingBag className="w-5 h-5" /> أضف للسلة
              </button>
              <button onClick={() => toggleWishlist(data)} aria-label="المفضلة" aria-pressed={liked} className="btn-outline w-14 !px-0">
                <Heart className={`w-5 h-5 ${liked ? 'fill-destructive text-destructive' : ''}`} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl p-3">
              <Truck className="w-4 h-4 shrink-0" /> التوصيل داخل الفيوم فقط. الدفع عند الطلب
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
