import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Copy, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService.js';
import { CATEGORIES, BADGES, formatPrice, PLACEHOLDER_IMG } from '../../lib/constants.js';
import { Modal, Field, Empty } from './ui.jsx';

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'doh4cvygr';
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lolo-store';

const blank = { name: '', description: '', price: '', originalPrice: '', stock: '', category: 'إلكترونيات', badge: '', image: '', colors: ['#000000'] };

const ProductForm = ({ initial, onClose, onSave, saving }) => {
  const [f, setF] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'فشل الرفع');
      set('image', data.secure_url);
      toast.success('تم رفع الصورة');
    } catch (e) {
      toast.error(e.message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim() || f.price === '') return toast.error('الاسم والسعر مطلوبان');
    if (f.originalPrice !== '' && Number(f.originalPrice) <= Number(f.price)) {
      return toast.error('السعر قبل الخصم لازم يكون أكبر من السعر الحالي');
    }
    onSave({
      ...f,
      name: f.name.trim(),
      price: Number(f.price),
      stock: Number(f.stock) || 0,
      originalPrice: f.originalPrice === '' ? null : Number(f.originalPrice),
      badge: f.badge || null,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="اسم المنتج *"><input className="field" value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={100} required /></Field>
      <Field label="الوصف" hint={`${f.description.length}/500`}><textarea className="field resize-none" rows={3} maxLength={500} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="السعر *"><input type="number" min="0" step="any" className="field" value={f.price} onChange={(e) => set('price', e.target.value)} required /></Field>
        <Field label="السعر قبل الخصم"><input type="number" min="0" step="any" className="field" value={f.originalPrice ?? ''} onChange={(e) => set('originalPrice', e.target.value)} /></Field>
        <Field label="الكمية"><input type="number" min="0" className="field" value={f.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
        <Field label="الشارة"><select className="field" value={f.badge || ''} onChange={(e) => set('badge', e.target.value)}>{BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></Field>
      </div>

      <Field label="الفئة"><select className="field" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>

      <div>
        <span className="text-xs font-bold mb-1.5 block">الصورة</span>
        <div className="flex gap-3 items-start">
          <img src={f.image || PLACEHOLDER_IMG} alt="" className="w-24 h-24 rounded-xl object-cover border border-border shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
          <div className="flex-1 grid gap-2">
            <label className="btn-outline cursor-pointer w-fit">
              <Upload className="w-4 h-4" />{uploading ? 'جاري الرفع...' : 'رفع صورة'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            <input className="field" dir="ltr" placeholder="أو الصق رابط الصورة" value={f.image} onChange={(e) => set('image', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <span className="text-xs font-bold mb-1.5 block">الألوان</span>
        <div className="flex flex-wrap gap-2">
          {f.colors.map((c, i) => (
            <div key={i} className="relative">
              <input type="color" value={c} onChange={(e) => set('colors', f.colors.map((x, j) => (j === i ? e.target.value : x)))} className="w-12 h-12 rounded-xl border border-border cursor-pointer p-0.5 bg-card" aria-label={`اللون ${i + 1}`} />
              {f.colors.length > 1 && (
                <button type="button" onClick={() => set('colors', f.colors.filter((_, j) => j !== i))} aria-label="حذف اللون" className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground grid place-items-center"><X className="w-3 h-3" /></button>
              )}
            </div>
          ))}
          {f.colors.length < 10 && (
            <button type="button" onClick={() => set('colors', [...f.colors, '#000000'])} className="w-12 h-12 rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary" aria-label="إضافة لون"><Plus className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
        <button type="button" onClick={onClose} className="btn-outline">إلغاء</button>
      </div>
    </form>
  );
};

const ProductsTab = () => {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: productService.getAll });
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('الكل');

  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); };

  const save = useMutation({
    mutationFn: ({ id, data }) => (id ? productService.update(id, data) : productService.create(data)),
    onSuccess: (_, v) => { toast.success(v.id ? 'تم تحديث المنتج ✅' : 'تمت إضافة المنتج ✅'); setEditing(null); refresh(); },
    onError: (e) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => { toast.success('تم حذف المنتج'); refresh(); },
    onError: (e) => toast.error(e.message),
  });
  const quick = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => (cat === 'الكل' || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
  }, [products, search, cat]);

  const toForm = (p) => ({
    name: p.name, description: p.description || '', price: p.price, originalPrice: p.originalPrice ?? '',
    stock: p.stock ?? 0, category: p.category || 'عام', badge: p.badge || '', image: p.image || '',
    colors: p.colors?.length ? p.colors : ['#000000'],
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="field pr-10" placeholder="بحث في المنتجات..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="field sm:w-44" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>الكل</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setEditing({})} className="btn-primary"><Plus className="w-4 h-4" /> منتج جديد</button>
      </div>

      {isLoading ? <Empty>جاري التحميل...</Empty> : list.length === 0 ? <Empty>لا توجد منتجات</Empty> : (
        <div className="grid gap-3">
          {list.map((p) => (
            <div key={p._id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
              <img src={p.image || PLACEHOLDER_IMG} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category} · {formatPrice(p.price)}{p.originalPrice ? <s className="mr-1.5">{formatPrice(p.originalPrice)}</s> : null}</p>
                <div className="flex items-center gap-1 mt-1.5">{(p.colors || []).slice(0, 6).map((c, i) => <span key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />)}</div>
              </div>
              <label className="hidden sm:flex flex-col items-center text-[10px] text-muted-foreground">
                الكمية
                <input type="number" min="0" defaultValue={p.stock || 0} key={p.stock}
                  onBlur={(e) => { const v = Math.max(0, parseInt(e.target.value, 10) || 0); if (v !== (p.stock || 0)) quick.mutate({ id: p._id, data: { stock: v } }); }}
                  className="field !w-16 !px-2 !py-1.5 text-center text-sm" aria-label="تعديل الكمية" />
              </label>
              <div className="flex gap-1.5">
                <button onClick={() => setEditing({ ...p, _isEdit: true })} aria-label="تعديل" className="w-9 h-9 rounded-lg bg-muted hover:bg-border grid place-items-center"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setEditing({ ...p, _dup: true })} aria-label="نسخ" className="hidden sm:grid w-9 h-9 rounded-lg bg-muted hover:bg-border place-items-center"><Copy className="w-4 h-4" /></button>
                <button onClick={() => window.confirm(`حذف "${p.name}"؟`) && del.mutate(p._id)} aria-label="حذف" className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground grid place-items-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal wide title={editing._isEdit ? 'تعديل المنتج' : editing._dup ? 'نسخ منتج' : 'منتج جديد'} onClose={() => setEditing(null)}>
          <ProductForm
            initial={editing._isEdit || editing._dup ? { ...toForm(editing), name: editing._dup ? `${editing.name} (نسخة)` : editing.name } : blank}
            saving={save.isPending}
            onClose={() => setEditing(null)}
            onSave={(data) => save.mutate({ id: editing._isEdit ? editing._id : null, data })}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProductsTab;
