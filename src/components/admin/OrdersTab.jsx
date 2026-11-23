import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, MessageCircle, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { ORDER_STATUS, formatPrice, PLACEHOLDER_IMG } from '../../lib/constants.js';
import { Modal, Field, Empty, fmtDate } from './ui.jsx';

const waLink = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${d.startsWith('20') ? d : d.replace(/^0/, '20')}`;
};

const OrderEdit = ({ order, onClose, onSave, saving }) => {
  const [c, setC] = useState({ ...order.customer });
  const [note, setNote] = useState(order.adminNote || '');
  const [fee, setFee] = useState(order.deliveryFee ?? 0);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ customer: c, adminNote: note, deliveryFee: Number(fee) || 0 }); }} className="grid gap-3">
      {[['name', 'الاسم'], ['phone', 'الهاتف'], ['email', 'البريد'], ['city', 'المدينة']].map(([k, l]) => (
        <Field key={k} label={l}><input className="field" value={c[k] || ''} onChange={(e) => setC({ ...c, [k]: e.target.value })} /></Field>
      ))}
      <Field label="العنوان"><textarea rows={2} className="field resize-none" value={c.address || ''} onChange={(e) => setC({ ...c, address: e.target.value })} /></Field>
      <Field label="رسوم التوصيل"><input type="number" min="0" className="field" value={fee} onChange={(e) => setFee(e.target.value)} /></Field>
      <Field label="ملاحظة داخلية (لا تظهر للعميل)"><textarea rows={2} className="field resize-none" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="flex gap-3 pt-1"><button className="btn-primary flex-1" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button><button type="button" className="btn-outline" onClick={onClose}>إلغاء</button></div>
    </form>
  );
};

const OrdersTab = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: () => api('/api/orders', { admin: true }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); };

  const patch = useMutation({
    mutationFn: ({ id, data }) => api(`/api/orders/${id}`, { method: 'PATCH', body: data, admin: true }),
    onSuccess: () => { toast.success('تم التحديث ✅'); setEditing(null); refresh(); },
    onError: (e) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id) => api(`/api/orders/${id}`, { method: 'DELETE', admin: true }),
    onSuccess: () => { toast.success('تم حذف الطلب'); refresh(); },
    onError: (e) => toast.error(e.message),
  });

  const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {[['all', 'الكل'], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition ${filter === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
            {l} {k === 'all' ? `(${orders.length})` : `(${orders.filter((o) => o.status === k).length})`}
          </button>
        ))}
      </div>

      {isLoading ? <Empty>جاري التحميل...</Empty> : list.length === 0 ? <Empty>لا توجد طلبات</Empty> : (
        <div className="grid gap-3">
          {list.map((o) => {
            const isOpen = open === o._id;
            return (
              <div key={o._id} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : o._id)} className="w-full text-start p-4 flex items-center gap-3 flex-wrap" aria-expanded={isOpen}>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-bold text-sm">{o.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(o.createdAt)}</p>
                  </div>
                  <span className="font-black text-primary">{formatPrice(o.total)}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ORDER_STATUS[o.status]?.cls}`}>{ORDER_STATUS[o.status]?.label}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 grid gap-4 bg-muted/30">
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <p><b>الهاتف:</b> <span dir="ltr">{o.customer?.phone}</span></p>
                      <p><b>المدينة:</b> {o.customer?.city}</p>
                      <p className="sm:col-span-2"><b>العنوان:</b> {o.customer?.address}</p>
                      {o.customer?.email && <p><b>البريد:</b> {o.customer.email}</p>}
                      {o.customer?.notes && <p className="sm:col-span-2"><b>ملاحظات العميل:</b> {o.customer.notes}</p>}
                      {o.adminNote && <p className="sm:col-span-2 text-amber-800 bg-amber-50 rounded-lg p-2"><b>ملاحظتك:</b> {o.adminNote}</p>}
                    </div>

                    <div className="grid gap-2">
                      {o.items?.map((it, i) => (
                        <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-2 border border-border">
                          <img src={it.image || PLACEHOLDER_IMG} alt="" className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
                          <div className="flex-1 min-w-0 text-sm"><p className="font-bold truncate">{it.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">{it.selectedColor && <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: it.selectedColor }} />}× {it.quantity} · {formatPrice(it.price)}</p></div>
                          <b className="text-sm">{formatPrice(it.price * it.quantity)}</b>
                        </div>
                      ))}
                      <div className="text-sm text-muted-foreground flex justify-between px-1"><span>المنتجات {formatPrice(o.totalPrice)} + توصيل {formatPrice(o.deliveryFee)}</span><b className="text-foreground">الإجمالي {formatPrice(o.total)}</b></div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select value={o.status} onChange={(e) => patch.mutate({ id: o._id, data: { status: e.target.value } })} className="field !w-auto" aria-label="حالة الطلب">
                        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <a href={`tel:${o.customer?.phone}`} className="btn-outline"><Phone className="w-4 h-4" /> اتصال</a>
                      <a href={waLink(o.customer?.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline"><MessageCircle className="w-4 h-4" /> واتساب</a>
                      <button onClick={() => setEditing(o)} className="btn-outline"><Pencil className="w-4 h-4" /> تعديل</button>
                      <button onClick={() => window.confirm('حذف الطلب نهائياً؟') && del.mutate(o._id)} className="btn-danger mr-auto"><Trash2 className="w-4 h-4" /> حذف</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title="تعديل الطلب" onClose={() => setEditing(null)}>
          <OrderEdit order={editing} saving={patch.isPending} onClose={() => setEditing(null)} onSave={(data) => patch.mutate({ id: editing._id, data })} />
        </Modal>
      )}
    </div>
  );
};

export default OrdersTab;
