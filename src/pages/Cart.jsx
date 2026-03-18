import { useState } from 'react';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { useCart } from '../context/CartContext.jsx';
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DELIVERY_FEE = 30;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [sending, setSending] = useState(false);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (items.length === 0) { 
      toast.error('السلة فارغة!'); 
      return; 
    }

    setSending(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
        image: i.product.image,
        category: i.product.category || 'عام',
      }));

      const res = await fetch(`${API_URL}/api/orders`, {  // ← استخدم API_URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: orderItems,
          totalPrice,
          deliveryFee: DELIVERY_FEE,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        clearCart();
        setForm({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
      } else {
        toast.error(data.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('تعذر الاتصال بالسيرفر. تأكد من أن الباك اند يعمل');
    } finally {
      setSending(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="container mx-auto px-4 mt-8 text-center py-20">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات بعد</p>
          <Link to="/products" className="inline-flex px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
            تصفح المنتجات
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8 max-w-5xl">
        <SectionTitle subtitle={`${items.length} منتج في السلة`}>🛒 سلة التسوق</SectionTitle>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border shadow-card">
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-card-foreground truncate">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.product.category || 'عام'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: item.selectedColor }} />
                    <span className="text-xs text-muted-foreground">{item.product.price} ج.م</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-border transition">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-border transition">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-extrabold text-foreground whitespace-nowrap">{item.product.price * item.quantity} ج.م</span>
                <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}

            <div className="bg-muted rounded-xl p-4 mt-2 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">المنتجات</span><span className="font-semibold">{totalPrice} ج.م</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">التوصيل</span><span className="font-semibold">{DELIVERY_FEE} ج.م</span></div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="font-extrabold text-lg text-primary">{totalPrice + DELIVERY_FEE} ج.م</span>
              </div>
            </div>
            <div className="bg-accent/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">💬 سيتم التواصل معك لإتمام الأوردر ودفع العربون</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-3 bg-card p-6 rounded-2xl border border-border shadow-card h-fit sticky top-24">
            <h3 className="text-base font-bold text-foreground mb-1">بيانات التوصيل</h3>
            {[
              { label: 'الاسم الكامل *', field: 'name', type: 'text', placeholder: 'اسمك' },
              { label: 'رقم الهاتف *', field: 'phone', type: 'tel', placeholder: '01xxxxxxxxx', dir: 'ltr' },
              { label: 'البريد الإلكتروني', field: 'email', type: 'email', placeholder: 'email@example.com', dir: 'ltr' },
              { label: 'المدينة *', field: 'city', type: 'text', placeholder: 'القاهرة' },
            ].map(({ label, field, type, placeholder, dir }) => (
              <div key={field}>
                <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                <input type={type} value={form[field]} onChange={(e) => update(field, e.target.value)} dir={dir}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">العنوان بالتفصيل *</label>
              <textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="الشارع، المنطقة، رقم المبنى..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">ملاحظات إضافية</label>
              <input type="text" value={form.notes} onChange={(e) => update('notes', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="أي تفاصيل إضافية..." />
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
              <Send className="w-4 h-4" />
              {sending ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;