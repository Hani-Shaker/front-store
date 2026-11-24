import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Send, ShoppingBag, CheckCircle2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { api } from '../lib/api.js';
import { formatPrice, PLACEHOLDER_IMG, getImages, optimize } from '../lib/constants.js';

const EMPTY = { name: '', phone: '', email: '', address: '', city: '', notes: '' };
const PHONE_RE = /^(\+?20|0)?1[0125]\d{8}$/;

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { deliveryFee, freeShippingThreshold, whatsapp } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const fee = freeShippingThreshold > 0 && totalPrice >= freeShippingThreshold ? 0 : deliveryFee;
  const remainingForFree = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - totalPrice) : 0;
  const progress = freeShippingThreshold > 0 ? Math.min(100, (totalPrice / freeShippingThreshold) * 100) : 0;

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      return toast.error('يرجى ملء جميع الحقول المطلوبة');
    }
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) {
      return toast.error('رقم الهاتف غير صحيح (مثال: 01012345678)');
    }

    setSending(true);
    try {
      await api('/api/orders', {
        method: 'POST',
        body: {
          customer: form,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            image: i.selectedImage || getImages(i.product, i.selectedColor)[0] || i.product.image,
            selectedImage: i.selectedImage || undefined,
            selectedImageIndex: i.selectedImageIndex || undefined,
            category: i.product.category,
          })),
        },
      });
      clearCart();
      setForm(EMPTY);
      setDone(true);
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <Layout>
        <section className="container mx-auto px-4 py-20 text-center max-w-md">
          <CheckCircle2 className="w-20 h-20 mx-auto text-badge-new mb-5" />
          <h2 className="text-2xl font-extrabold mb-2">تم استلام طلبك بنجاح! 🎉</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">هنتواصل معاك قريباً لتأكيد الطلب وتفاصيل التوصيل.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary px-6 py-3">متابعة التسوق</Link>
            {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-3">تواصل واتساب</a>}
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="container mx-auto px-4 text-center py-24">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات بعد</p>
          <Link to="/products" className="btn-primary px-6 py-3">تصفح المنتجات</Link>
        </section>
      </Layout>
    );
  }

  const fields = [
    { label: 'الاسم الكامل *', field: 'name', type: 'text', placeholder: 'اسمك', auto: 'name' },
    { label: 'رقم الهاتف *', field: 'phone', type: 'tel', placeholder: '01xxxxxxxxx', dir: 'ltr', auto: 'tel' },
    { label: 'البريد الإلكتروني', field: 'email', type: 'email', placeholder: 'email@example.com', dir: 'ltr', auto: 'email' },
    { label: 'المدينة / المحافظة *', field: 'city', type: 'text', placeholder: 'الفيوم', auto: 'address-level2' },
  ];

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8 max-w-6xl">
        <SectionTitle subtitle={`${items.length} صنف في السلة`}>سلة التسوق</SectionTitle>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 flex flex-col gap-3">
            {freeShippingThreshold > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm font-bold mb-2">
                  <Truck className="w-4 h-4 text-primary" />
                  {remainingForFree > 0 ? `ضيف ${formatPrice(remainingForFree)} وخد شحن مجاني!` : 'مبروك! حصلت على شحن مجاني 🎉'}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedColor}-${item.selectedImage}`} className="flex items-center gap-3 sm:gap-4 bg-card rounded-2xl p-3 sm:p-4 border border-border shadow-card">
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img src={optimize(item.selectedImage || getImages(item.product, item.selectedColor)[0] || item.product.image, 200) || PLACEHOLDER_IMG} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{item.product.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {item.selectedColor && <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: item.selectedColor }} />}
                    <span>{formatPrice(item.product.price)}</span>
                    {item.selectedImageIndex && <span className="bg-primary/10 text-primary font-bold rounded-full px-2 py-0.5">الصورة رقم {item.selectedImageIndex}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.quantity - 1, item.selectedImage)} aria-label="تقليل" className="w-8 h-8 grid place-items-center hover:bg-muted rounded-s-lg"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.quantity + 1, item.selectedImage)} aria-label="زيادة" className="w-8 h-8 grid place-items-center hover:bg-muted rounded-e-lg"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="text-sm font-extrabold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedImage)} aria-label="حذف" className="w-9 h-9 shrink-0 rounded-full hover:bg-destructive/10 grid place-items-center transition">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}

            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">المنتجات</span><span className="font-semibold">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">التوصيل</span><span className="font-semibold">{fee === 0 ? 'مجاني' : formatPrice(fee)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="font-bold">الإجمالي</span>
                <span className="font-black text-xl text-primary">{formatPrice(totalPrice + fee)}</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground bg-accent/20 rounded-xl p-3">💬 سيتم التواصل معك لتأكيد الطلب · الدفع عند الاستلام</p>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-3.5 bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-card lg:sticky lg:top-24">
            <h3 className="text-base font-extrabold">بيانات التوصيل</h3>
            {fields.map(({ label, field, type, placeholder, dir, auto }) => (
              <div key={field}>
                <label htmlFor={field} className="text-xs font-bold mb-1.5 block">{label}</label>
                <input id={field} type={type} value={form[field]} onChange={(e) => update(field, e.target.value)} dir={dir} autoComplete={auto} placeholder={placeholder} className="field" />
              </div>
            ))}
            <div>
              <label htmlFor="address" className="text-xs font-bold mb-1.5 block">العنوان بالتفصيل *</label>
              <textarea id="address" value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} autoComplete="street-address" placeholder="الشارع، المنطقة، رقم المبنى..." className="field resize-none" />
            </div>
            <div>
              <label htmlFor="notes" className="text-xs font-bold mb-1.5 block">ملاحظات إضافية</label>
              <input id="notes" type="text" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="أي تفاصيل إضافية..." className="field" />
            </div>
            <button type="submit" disabled={sending} className="btn-primary py-3.5 text-base mt-1">
              <Send className="w-4 h-4" />{sending ? 'جاري الإرسال...' : `تأكيد الطلب · ${formatPrice(totalPrice + fee)}`}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
