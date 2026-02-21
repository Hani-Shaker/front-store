import { useState } from 'react';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setForm({ name: '', email: '', message: '' });
      } else {
        toast.error(data.message || 'حدث خطأ');
      }
    } catch {
      toast.error('تعذر الاتصال بالسيرفر');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8 max-w-4xl">
        <SectionTitle subtitle="نحن هنا لمساعدتك">📬 اتصل بنا</SectionTitle>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground flex flex-col justify-center gap-6">
            <h3 className="text-xl font-bold">تواصل معنا</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              يسعدنا تواصلك معنا! فريقنا جاهز للرد عليك في أي وقت.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              {[
                { Icon: Phone, label: 'الهاتف', value: '+20 123 456 7890' },
                { Icon: Mail, label: 'البريد الإلكتروني', value: 'info@anaqastore.com' },
                { Icon: MapPin, label: 'العنوان', value: 'القاهرة، مصر' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-card p-6 rounded-2xl border border-border shadow-card">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">الاسم *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="اسمك الكريم" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="email@example.com" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">الرسالة *</label>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="اكتب رسالتك هنا..." />
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send className="w-4 h-4" />
              {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
