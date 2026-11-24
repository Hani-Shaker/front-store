import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Copy, Search, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService.js';
import { CATEGORIES, BADGES, formatPrice, PLACEHOLDER_IMG, normalizeProduct, optimize } from '../../lib/constants.js';
import { Modal, Field, Empty } from './ui.jsx';
import ImageListEditor from './ImageListEditor.jsx';
import BulkAddModal from './BulkAddModal.jsx';

const blank = { name: '', description: '', price: '', originalPrice: '', stock: '', category: 'إلكترونيات', badge: '', images: [], pickImage: true, hasColors: false, variants: [] };

const ProductForm = ({ initial, onClose, onSave, saving }) => {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setVariant = (i, patch) => set('variants', f.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim() || f.price === '') return toast.error('الاسم والسعر مطلوبان');
    if (f.originalPrice !== '' && f.originalPrice !== null && Number(f.originalPrice) <= Number(f.price)) {
      return toast.error('السعر قبل الخصم لازم يكون أكبر من السعر الحالي');
    }
    const colors = f.variants.map((v) => v.color.toLowerCase());
    if (f.hasColors && new Set(colors).size !== colors.length) return toast.error('فيه لون متكرر');
    onSave({
      name: f.name.trim(),
      description: f.description,
      category: f.category,
      price: Number(f.price),
      stock: Number(f.stock) || 0,
      originalPrice: f.originalPrice === '' || f.originalPrice === null ? null : Number(f.originalPrice),
      badge: f.badge || null,
      images: f.images,
      pickImage: f.pickImage,
      variants: f.hasColors ? f.variants : [],
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
        <span className="text-xs font-bold mb-1 block">الصور {f.hasColors && '(تظهر لو اللون ملوش صور خاصة)'}</span>
        <p className="text-[11px] text-muted-foreground mb-2">لو رفعت أكتر من صورة بتتقلب لوحدها على كارت المنتج. النجمة = الصورة الرئيسية.</p>
        <ImageListEditor images={f.images} onChange={(v) => set('images', v)} />
      </div>

      <label className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition ${f.pickImage ? 'border-primary bg-primary/5' : 'border-border'}`}>
        <input type="checkbox" checked={f.pickImage} onChange={(e) => set('pickImage', e.target.checked)} className="w-5 h-5 mt-0.5 accent-[hsl(var(--primary))]" />
        <span>
          <span className="text-sm font-bold block">العميل يختار الصورة اللي تعجبه</span>
          <span className="text-[11px] text-muted-foreground">كل صورة بتبقى تصميم/اختيار. العميل يختار واحدة، والاختيار بيظهر لك في الطلب (صورة ورقمها). مفيد لما تضيف منتج واحد بكذا تصميم. أطفيها لو الصور كلها زوايا لنفس المنتج.</span>
        </span>
      </label>

      <div className="rounded-2xl border border-border p-4 bg-muted/30">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={f.hasColors} onChange={(e) => set('hasColors', e.target.checked)} className="w-5 h-5 accent-[hsl(var(--primary))]" />
          <span className="text-sm font-bold">المنتج له ألوان مختلفة</span>
          <span className="text-[11px] text-muted-foreground">(سيبها فاضية لو مفيش ألوان)</span>
        </label>

        {f.hasColors && (
          <div className="grid gap-3 mt-4">
            {f.variants.map((v, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-3 mb-3">
                  <input type="color" value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} className="w-11 h-11 rounded-xl border border-border cursor-pointer p-0.5 bg-card" aria-label={`لون ${i + 1}`} />
                  <span className="text-xs font-bold flex-1">لون {i + 1} <span className="text-muted-foreground font-normal" dir="ltr">{v.color}</span></span>
                  <button type="button" onClick={() => set('variants', f.variants.filter((_, j) => j !== i))} className="btn-danger !px-3 !py-1.5 text-xs"><Trash2 className="w-3.5 h-3.5" /> حذف اللون</button>
                </div>
                <ImageListEditor images={v.images} onChange={(imgs) => setVariant(i, { images: imgs })} label="صور اللون" />
              </div>
            ))}
            {f.variants.length < 12 && (
              <button type="button" onClick={() => set('variants', [...f.variants, { color: '#000000', images: [] }])} className="btn-outline w-fit"><Plus className="w-4 h-4" /> إضافة لون</button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
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
  const [bulk, setBulk] = useState(false);

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

  const toForm = (raw) => {
    const p = normalizeProduct(raw);
    return {
      name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice ?? '',
      stock: p.stock ?? 0, category: p.category, badge: p.badge || '',
      images: p.images,
      pickImage: !!raw.pickImage,
      hasColors: p.colors.length > 0,
      variants: p.variants.length ? p.variants : p.colors.map((c) => ({ color: c, images: [] })),
    };
  };

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
        <button onClick={() => setBulk(true)} className="btn-outline"><Layers className="w-4 h-4" /> إضافة سريعة لعدة منتجات</button>
        <button onClick={() => setEditing({})} className="btn-primary"><Plus className="w-4 h-4" /> منتج جديد</button>
      </div>

      {isLoading ? <Empty>جاري التحميل...</Empty> : list.length === 0 ? <Empty>لا توجد منتجات</Empty> : (
        <div className="grid gap-3">
          {list.map((p) => (
            <div key={p._id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
              <img src={optimize(p.image, 160) || PLACEHOLDER_IMG} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category} · {formatPrice(p.price)}{p.originalPrice ? <s className="mr-1.5">{formatPrice(p.originalPrice)}</s> : null}</p>
                <div className="flex items-center gap-1 mt-1.5">{(p.colors || []).slice(0, 6).map((c, i) => <span key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c }} />)}{(p.images?.length || 0) > 1 && <span className="text-[10px] text-muted-foreground mr-1">{p.images.length} صور</span>}</div>
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

      {bulk && <BulkAddModal onClose={() => setBulk(false)} onDone={refresh} />}

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
