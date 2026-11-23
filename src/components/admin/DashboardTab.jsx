import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Clock, Mail, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ORDER_STATUS, formatPrice, PLACEHOLDER_IMG } from '../../lib/constants.js';
import { StatCard, Empty, fmtDate } from './ui.jsx';

const DashboardTab = ({ go }) => {
  const { data: s, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api('/api/stats', { admin: true }), refetchInterval: 60_000 });
  if (isLoading || !s) return <Empty>جاري التحميل...</Empty>;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard Icon={Wallet} label="إجمالي المبيعات" value={formatPrice(s.totalRevenue)} sub="بدون الطلبات الملغية" />
        <StatCard Icon={TrendingUp} label="مبيعات آخر 30 يوم" value={formatPrice(s.monthRevenue)} sub={`${s.monthOrders} طلب`} />
        <StatCard Icon={Clock} label="طلبات قيد المراجعة" value={s.pendingOrders} tone={s.pendingOrders ? 'warn' : 'primary'} />
        <StatCard Icon={ShoppingCart} label="كل الطلبات" value={s.ordersCount} />
        <StatCard Icon={Package} label="المنتجات" value={s.productsCount} />
        <StatCard Icon={Mail} label="رسائل جديدة" value={s.newMessages} tone={s.newMessages ? 'warn' : 'primary'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-card border border-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3"><h3 className="font-extrabold text-sm">آخر الطلبات</h3><button onClick={() => go('orders')} className="text-xs text-primary font-bold">عرض الكل</button></div>
          {s.recentOrders.length === 0 ? <Empty>لا توجد طلبات بعد</Empty> : s.recentOrders.map((o) => (
            <div key={o._id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{o.customer?.name}</p><p className="text-xs text-muted-foreground">{fmtDate(o.createdAt)}</p></div>
              <span className="text-sm font-black">{formatPrice(o.total)}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS[o.status]?.cls}`}>{ORDER_STATUS[o.status]?.label}</span>
            </div>
          ))}
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3"><h3 className="font-extrabold text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> مخزون منخفض</h3><button onClick={() => go('products')} className="text-xs text-primary font-bold">إدارة المنتجات</button></div>
          {s.lowStock.length === 0 ? <Empty>المخزون سليم ✅</Empty> : s.lowStock.map((p) => (
            <div key={p._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <img src={p.image || PLACEHOLDER_IMG} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
              <p className="flex-1 text-sm font-bold truncate">{p.name}</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{p.stock === 0 ? 'نفدت' : `باقي ${p.stock}`}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default DashboardTab;
