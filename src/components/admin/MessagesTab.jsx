import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api.js';
import { Empty, fmtDate } from './ui.jsx';

const STATUS = { new: ['جديدة', 'bg-amber-100 text-amber-800'], read: ['مقروءة', 'bg-sky-100 text-sky-800'], replied: ['تم الرد', 'bg-emerald-100 text-emerald-800'] };

const MessagesTab = () => {
  const qc = useQueryClient();
  const { data: msgs = [], isLoading } = useQuery({ queryKey: ['admin-messages'], queryFn: () => api('/api/contact', { admin: true }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-messages'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); };

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => api(`/api/contact/${id}`, { method: 'PATCH', body: { status }, admin: true }),
    onSuccess: refresh, onError: (e) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id) => api(`/api/contact/${id}`, { method: 'DELETE', admin: true }),
    onSuccess: () => { toast.success('تم الحذف'); refresh(); }, onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Empty>جاري التحميل...</Empty>;
  if (!msgs.length) return <Empty>لا توجد رسائل</Empty>;

  return (
    <div className="grid gap-3">
      {msgs.map((m) => (
        <article key={m._id} className={`bg-card border rounded-2xl p-4 shadow-card ${m.status === 'new' ? 'border-primary/40' : 'border-border'}`}>
          <header className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-bold text-sm">{m.name} <span className="text-muted-foreground font-normal" dir="ltr">· {m.email}</span></p>
              <p className="text-xs text-muted-foreground">{fmtDate(m.createdAt)} · {m.subject}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS[m.status]?.[1]}`}>{STATUS[m.status]?.[0]}</span>
          </header>
          <p className="text-sm leading-relaxed mt-3 whitespace-pre-wrap bg-muted/50 rounded-xl p-3">{m.message}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent('رد: ' + (m.subject || ''))}`} onClick={() => m.status !== 'replied' && setStatus.mutate({ id: m._id, status: 'replied' })} className="btn-outline"><Mail className="w-4 h-4" /> رد بالإيميل</a>
            {m.status === 'new' && <button onClick={() => setStatus.mutate({ id: m._id, status: 'read' })} className="btn-outline"><Check className="w-4 h-4" /> تعليم كمقروءة</button>}
            {m.status !== 'replied' && <button onClick={() => setStatus.mutate({ id: m._id, status: 'replied' })} className="btn-outline"><CheckCheck className="w-4 h-4" /> تم الرد</button>}
            <button onClick={() => window.confirm('حذف الرسالة؟') && del.mutate(m._id)} className="btn-danger mr-auto"><Trash2 className="w-4 h-4" /></button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default MessagesTab;
