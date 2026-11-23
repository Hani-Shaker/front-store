import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { DEFAULT_SETTINGS } from '../../context/SettingsContext.jsx';
import { Field } from './ui.jsx';

const SettingsTab = () => {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['settings'], queryFn: () => api('/api/settings') });
  const [f, setF] = useState(DEFAULT_SETTINGS);
  useEffect(() => { if (data) setF({ ...DEFAULT_SETTINGS, ...data }); }, [data]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: () => api('/api/settings', { method: 'PUT', body: f, admin: true }),
    onSuccess: () => { toast.success('تم حفظ الإعدادات ✅'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: (e) => toast.error(e.message),
  });

  const text = (k, label, props = {}) => <Field label={label}><input className="field" value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} {...props} /></Field>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-6 max-w-3xl">
      <section className="bg-card border border-border rounded-2xl p-5 grid gap-4 shadow-card">
        <h3 className="font-extrabold">بيانات المتجر</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {text('storeName', 'اسم المتجر', { maxLength: 60 })}
          {text('tagline', 'وصف مختصر', { maxLength: 160 })}
          {text('phone', 'رقم الهاتف', { dir: 'ltr' })}
          {text('whatsapp', 'واتساب (بكود الدولة، مثال 201012345678)', { dir: 'ltr' })}
          {text('email', 'البريد الإلكتروني', { dir: 'ltr' })}
          {text('address', 'العنوان')}
          {text('instagram', 'رابط إنستجرام', { dir: 'ltr', placeholder: 'https://instagram.com/...' })}
          {text('facebook', 'رابط فيسبوك', { dir: 'ltr', placeholder: 'https://facebook.com/...' })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5 grid gap-4 shadow-card">
        <h3 className="font-extrabold">الشحن والعروض</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="رسوم التوصيل (ج.م)"><input type="number" min="0" className="field" value={f.deliveryFee} onChange={(e) => set('deliveryFee', e.target.value)} /></Field>
          <Field label="شحن مجاني فوق (ج.م)" hint="اكتب 0 لتعطيله"><input type="number" min="0" className="field" value={f.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', e.target.value)} /></Field>
        </div>
        <Field label="شريط الإعلان أعلى الموقع" hint="اتركه فارغاً لإخفائه (أو لعرض رسالة الشحن المجاني تلقائياً)">
          <input className="field" maxLength={200} value={f.announcement} onChange={(e) => set('announcement', e.target.value)} placeholder="مثال: 🔥 خصم 20% على كل الإكسسوارات" />
        </Field>
      </section>

      <button className="btn-primary w-fit px-8 py-3" disabled={save.isPending}>{save.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button>
    </form>
  );
};

export default SettingsTab;
