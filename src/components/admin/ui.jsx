import { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, onClose, children, wide }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`bg-card w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl`}>
        <div className="sticky top-0 bg-card/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-border z-10">
          <h3 className="font-extrabold">{title}</h3>
          <button onClick={onClose} aria-label="إغلاق" className="w-9 h-9 rounded-full hover:bg-muted grid place-items-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-xs font-bold mb-1.5 block">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-muted-foreground mt-1 block">{hint}</span>}
  </label>
);

export const StatCard = ({ Icon, label, value, tone = 'primary', sub }) => (
  <div className="bg-card border border-border rounded-2xl p-4 shadow-card flex items-center gap-3">
    <span className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center ${tone === 'warn' ? 'bg-amber-100 text-amber-700' : tone === 'danger' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>
      <Icon className="w-5 h-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-black leading-tight truncate">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  </div>
);

export const Empty = ({ children }) => <div className="text-center py-14 text-muted-foreground text-sm">{children}</div>;

export const fmtDate = (d) =>
  new Date(d).toLocaleString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
