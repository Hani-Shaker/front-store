import { useRef, useState } from 'react';
import { ImagePlus, ClipboardPaste, Trash2, Plus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService.js';
import { uploadMany } from '../../lib/upload.js';
import { CATEGORIES, BADGES, optimize, PLACEHOLDER_IMG } from '../../lib/constants.js';
import { Modal, Field } from './ui.jsx';

let uid = 0;
const newRow = (p = {}) => ({ id: ++uid, name: '', price: '', stock: '', image: '', status: 'idle', error: '', ...p });

// "اسم | سعر | كمية" أو "اسم, سعر" أو tab (لصق من Excel)
const parseLines = (text) =>
  text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    // لو مفيش فواصل: "سماعة 250" أو "سماعة 250 10" (الأرقام في الآخر)
    const m = !/\t|\||,|،/.test(line) && line.match(/^(.*?\S)\s+([\d٠-٩.]+)(?:\s+([\d٠-٩.]+))?$/);
    const parts = m ? [m[1], m[2], m[3]].filter(Boolean) : line.split(/\t|\||,|،/).map((x) => x.trim());
    const nums = parts.filter((x) => /^[\d٠-٩.]+$/.test(x)).map((x) => x.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    const name = parts.find((x) => x && !/^[\d٠-٩.]+$/.test(x)) || '';
    return newRow({ name, price: nums[0] || '', stock: nums[1] || '' });
  });

const BulkAddModal = ({ onClose, onDone }) => {
  const [rows, setRows] = useState([]);
  const [defaults, setDefaults] = useState({ category: CATEGORIES[0], badge: '', stock: '10', price: '' });
  const [paste, setPaste] = useState('');
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const listRef = useRef(null);

  const update = (id, patch) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addImages = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const placeholders = files.map(() => newRow({ price: defaults.price, status: 'uploading' }));
    setRows((r) => [...r, ...placeholders]);
    setUploading((n) => n + files.length);
    await uploadMany(files, (i, res) => {
      update(placeholders[i].id, res.url ? { image: res.url, status: 'idle' } : { status: 'error', error: res.error });
      setUploading((n) => n - 1);
    });
  };

  const addPasted = () => {
    const parsed = parseLines(paste).map((r) => ({ ...r, price: r.price || defaults.price }));
    if (!parsed.length) return toast.error('اكتب سطر واحد على الأقل');
    setRows((r) => [...r, ...parsed]);
    setPaste('');
  };

  const focusNext = (e, id, field) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const idx = rows.findIndex((r) => r.id === id);
    const next = rows[idx + 1];
    const el = listRef.current?.querySelector(`[data-row="${next ? next.id : id}"][data-field="${next ? field : 'price'}"]`);
    el?.focus();
  };

  const saveAll = async () => {
    const todo = rows.filter((r) => r.status !== 'done');
    const invalid = todo.filter((r) => !r.name.trim() || r.price === '' || Number(r.price) < 0);
    if (!todo.length) return toast.error('مفيش منتجات للحفظ');
    if (invalid.length) {
      setRows((rs) => rs.map((r) => (invalid.includes(r) ? { ...r, status: 'error', error: 'الاسم والسعر مطلوبان' } : r)));
      return toast.error(`${invalid.length} منتج ناقصه الاسم أو السعر`);
    }
    if (uploading) return toast.error('استنى لحد ما الصور تخلص رفع');

    setSaving(true);
    let ok = 0;
    let next = 0;
    const worker = async () => {
      while (next < todo.length) {
        const r = todo[next++];
        update(r.id, { status: 'saving', error: '' });
        try {
          await productService.create({
            name: r.name.trim(),
            price: Number(r.price),
            stock: Number(r.stock !== '' ? r.stock : defaults.stock) || 0,
            category: defaults.category,
            badge: defaults.badge || null,
            images: r.image ? [r.image] : [],
            variants: [],
          });
          ok++;
          update(r.id, { status: 'done' });
        } catch (e) {
          update(r.id, { status: 'error', error: e.message });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, todo.length) }, worker));
    setSaving(false);
    onDone?.();
    if (ok === todo.length) { toast.success(`تمت إضافة ${ok} منتج ✅`); onClose(); }
    else toast.error(`اتضاف ${ok} من ${todo.length}. راجع الصفوف اللي فيها خطأ`);
  };

  const pending = rows.filter((r) => r.status !== 'done').length;

  return (
    <Modal wide title="إضافة سريعة لعدة منتجات" onClose={saving ? () => {} : onClose}>
      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer p-5 text-center transition">
            <ImagePlus className="w-7 h-7 mx-auto text-primary mb-2" />
            <p className="text-sm font-bold">اختار صور المنتجات كلها مرة واحدة</p>
            <p className="text-[11px] text-muted-foreground mt-1">كل صورة = منتج جديد. بتترفع تلقائياً</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
          </label>

          <div className="rounded-2xl border border-border p-3 grid gap-2">
            <p className="text-sm font-bold flex items-center gap-2"><ClipboardPaste className="w-4 h-4 text-primary" /> أو الصق قائمة (من Excel أو ملاحظات)</p>
            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={3} dir="rtl" className="field resize-none text-xs" placeholder={'أحمر شفاه | 120 | 10\\nسماعة بلوتوث | 250'} />
            <button type="button" onClick={addPasted} disabled={!paste.trim()} className="btn-outline !py-1.5 text-xs w-fit">إضافة الصفوف</button>
          </div>
        </div>

        <div className="rounded-2xl bg-muted/50 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="الفئة (للكل)"><select className="field" value={defaults.category} onChange={(e) => setDefaults({ ...defaults, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="الشارة (للكل)"><select className="field" value={defaults.badge} onChange={(e) => setDefaults({ ...defaults, badge: e.target.value })}>{BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></Field>
          <Field label="الكمية الافتراضية"><input type="number" min="0" className="field" value={defaults.stock} onChange={(e) => setDefaults({ ...defaults, stock: e.target.value })} /></Field>
          <Field label="سعر افتراضي" hint="للصفوف الجديدة"><input type="number" min="0" className="field" value={defaults.price} onChange={(e) => setDefaults({ ...defaults, price: e.target.value })} /></Field>
        </div>

        {rows.length > 0 && (
          <div ref={listRef} className="grid gap-2">
            <div className="hidden sm:grid grid-cols-[3.5rem_1fr_6rem_5rem_2.5rem] gap-2 text-[11px] font-bold text-muted-foreground px-1"><span /><span>الاسم</span><span>السعر</span><span>الكمية</span><span /></div>
            {rows.map((r) => (
              <div key={r.id} className={`grid grid-cols-[3.5rem_1fr_2.5rem] sm:grid-cols-[3.5rem_1fr_6rem_5rem_2.5rem] gap-2 items-center rounded-xl border p-2 ${r.status === 'error' ? 'border-destructive/50 bg-destructive/5' : r.status === 'done' ? 'border-emerald-300 bg-emerald-50 opacity-70' : 'border-border bg-card'}`}>
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted grid place-items-center">
                  {r.status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <img src={r.image ? optimize(r.image, 120) : PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />}
                </div>
                <input data-row={r.id} data-field="name" onKeyDown={(e) => focusNext(e, r.id, 'name')} value={r.name} onChange={(e) => update(r.id, { name: e.target.value, status: r.status === 'error' ? 'idle' : r.status })} placeholder="اسم المنتج" className="field !py-2" disabled={r.status === 'done'} />
                <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} aria-label="حذف الصف" className="w-9 h-9 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center sm:order-last"><Trash2 className="w-4 h-4" /></button>
                <input data-row={r.id} data-field="price" onKeyDown={(e) => focusNext(e, r.id, 'price')} type="number" min="0" step="any" value={r.price} onChange={(e) => update(r.id, { price: e.target.value })} placeholder="السعر" className="field !py-2 col-span-1 sm:col-auto" disabled={r.status === 'done'} />
                <input type="number" min="0" value={r.stock} onChange={(e) => update(r.id, { stock: e.target.value })} placeholder={defaults.stock || '0'} className="field !py-2 hidden sm:block" disabled={r.status === 'done'} />
                {(r.status === 'error' || r.status === 'done' || r.status === 'saving') && (
                  <p className="col-span-full text-[11px] flex items-center gap-1">
                    {r.status === 'done' && <><Check className="w-3 h-3 text-emerald-600" /> تم الحفظ</>}
                    {r.status === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> جاري الحفظ...</>}
                    {r.status === 'error' && <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{r.error}</span>}
                  </p>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setRows((rs) => [...rs, newRow({ price: defaults.price })])} className="btn-outline w-fit !py-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> صف فاضي</button>
          </div>
        )}

        <div className="sticky bottom-0 bg-card pt-3 -mb-1 flex items-center gap-3 border-t border-border">
          <button onClick={saveAll} disabled={saving || !pending || uploading > 0} className="btn-primary flex-1 py-3">
            {saving ? 'جاري الحفظ...' : uploading ? `جاري رفع ${uploading} صورة...` : `حفظ ${pending || ''} منتج`}
          </button>
          <button onClick={onClose} disabled={saving} className="btn-outline">إغلاق</button>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">بعد الحفظ تقدر تدخل على أي منتج وتضيف له ألوان وصور إضافية وتفاصيل.</p>
      </div>
    </Modal>
  );
};

export default BulkAddModal;
