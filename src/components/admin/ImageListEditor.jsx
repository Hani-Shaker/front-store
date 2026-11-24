import { useState } from 'react';
import { ImagePlus, X, ArrowRight, Star } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMany } from '../../lib/upload.js';
import { optimize } from '../../lib/constants.js';

/** قائمة صور: رفع متعدد، حذف، تقديم صورة لتكون الأولى */
const ImageListEditor = ({ images, onChange, max = 10, label = 'أضف صور' }) => {
  const [busy, setBusy] = useState(0);

  const add = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, max - images.length);
    if (!files.length) return;
    setBusy(files.length);
    const res = await uploadMany(files);
    const urls = res.filter((r) => r.url).map((r) => r.url);
    res.filter((r) => r.error).forEach((r) => toast.error(r.error));
    if (urls.length) onChange([...images, ...urls]);
    setBusy(0);
  };

  const makeFirst = (i) => onChange([images[i], ...images.filter((_, j) => j !== i)]);

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((src, i) => (
        <div key={src + i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
          <img src={optimize(src, 200)} alt="" className="w-full h-full object-cover" />
          {i === 0 && <span className="absolute bottom-1 right-1 bg-accent text-accent-foreground rounded-full w-5 h-5 grid place-items-center" title="الصورة الرئيسية"><Star className="w-3 h-3" /></span>}
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="حذف الصورة" className="absolute top-1 left-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground grid place-items-center"><X className="w-3 h-3" /></button>
          {i > 0 && <button type="button" onClick={() => makeFirst(i)} aria-label="اجعلها الأولى" title="اجعلها الأولى" className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-card/90 grid place-items-center opacity-0 group-hover:opacity-100 focus:opacity-100"><ArrowRight className="w-3 h-3" /></button>}
        </div>
      ))}
      {busy > 0 && <div className="w-20 h-20 rounded-xl skeleton grid place-items-center text-[10px] text-muted-foreground">جاري الرفع</div>}
      {images.length < max && (
        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer text-center" title={label}>
          <span className="flex flex-col items-center gap-1 text-[10px] font-bold"><ImagePlus className="w-5 h-5" />{label}</span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy > 0} onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        </label>
      )}
    </div>
  );
};

export default ImageListEditor;
