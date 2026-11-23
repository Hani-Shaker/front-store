import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { api } from '../lib/api.js';

const EMPTY = { name: '', email: '', subject: '', message: '' };

const Contact = () => {
  const s = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return toast.error('يرجى ملء الاسم والبريد والرسالة');
    setSending(true);
    try {
      const data = await api('/api/contact', { method: 'POST', body: form });
      toast.success(data?.message || 'تم إرسال رسالتك');
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setSending(false);
    }
  };

  const info = [
    { Icon: Phone, label: 'الهاتف', value: s.phone, href: `tel:${s.phone}`, ltr: true },
    { Icon: Mail, label: 'البريد الإلكتروني', value: s.email, href: `mailto:${s.email}` },
    { Icon: MapPin, label: 'العنوان', value: s.address },
  ];

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8 max-w-5xl">
        <SectionTitle subtitle="نحن هنا لمساعدتك">اتصل بنا</SectionTitle>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 bg-gradient-hero rounded-3xl p-7 text-primary-foreground flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-extrabold mb-2">تواصل معنا</h3>
              <p className="text-sm opacity-80 leading-relaxed">يسعدنا تواصلك معنا! فريقنا جاهز للرد عليك في أي وقت.</p>
            </div>
            <div className="flex flex-col gap-4">
              {info.map(({ Icon, label, value, href, ltr }) => {
                const Tag = href ? 'a' : 'div';
                return (
                  <Tag key={label} {...(href ? { href } : {})} className="flex items-center gap-3 hover:opacity-90">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-primary-foreground/15 grid place-items-center"><Icon className="w-4 h-4" /></span>
                    <span>
                      <span className="block text-xs opacity-60">{label}</span>
                      <span className="block text-sm font-bold break-all" dir={ltr ? 'ltr' : undefined}>{value}</span>
                    </span>
                  </Tag>
                );
              })}
            </div>
            {s.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:opacity-90 mt-auto">
                <MessageCircle className="w-4 h-4" /> راسلنا على واتساب
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-name" className="text-xs font-bold mb-1.5 block">الاسم *</label>
                <input id="c-name" value={form.name} onChange={(e) => update('name', e.target.value)} className="field" placeholder="اسمك الكريم" autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="c-email" className="text-xs font-bold mb-1.5 block">البريد الإلكتروني *</label>
                <input id="c-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="field" placeholder="email@example.com" dir="ltr" autoComplete="email" required />
              </div>
            </div>
            <div>
              <label htmlFor="c-subject" className="text-xs font-bold mb-1.5 block">الموضوع</label>
              <input id="c-subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} className="field" placeholder="موضوع الرسالة" />
            </div>
            <div>
              <label htmlFor="c-msg" className="text-xs font-bold mb-1.5 block">الرسالة *</label>
              <textarea id="c-msg" value={form.message} onChange={(e) => update('message', e.target.value)} rows={5} className="field resize-none" placeholder="اكتب رسالتك هنا..." required />
            </div>
            <button type="submit" disabled={sending} className="btn-primary py-3.5"><Send className="w-4 h-4" />{sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}</button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
