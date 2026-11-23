import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Package, ShoppingCart, Mail, Settings, LogOut, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api, auth } from '../../lib/api.js';
import DashboardTab from '../../components/admin/DashboardTab.jsx';
import ProductsTab from '../../components/admin/ProductsTab.jsx';
import OrdersTab from '../../components/admin/OrdersTab.jsx';
import MessagesTab from '../../components/admin/MessagesTab.jsx';
import SettingsTab from '../../components/admin/SettingsTab.jsx';

const TABS = [
  { id: 'dashboard', label: 'الرئيسية', Icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', Icon: Package },
  { id: 'orders', label: 'الطلبات', Icon: ShoppingCart },
  { id: 'messages', label: 'الرسائل', Icon: Mail },
  { id: 'settings', label: 'الإعدادات', Icon: Settings },
];

const Login = ({ onSuccess }) => {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/api/admin/verify-password', { method: 'POST', body: { password: pw } });
      if (!data?.token) throw new Error('رد غير متوقع من السيرفر');
      auth.set(data.token);
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'كلمة السر خاطئة');
      setPw('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4">
      <form onSubmit={submit} className="bg-card w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
        <span className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-hero grid place-items-center"><Lock className="w-6 h-6 text-primary-foreground" /></span>
        <h1 className="text-xl font-extrabold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">أدخل كلمة السر للمتابعة</p>
        <input type="password" autoFocus required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="كلمة السر" autoComplete="current-password" className="field text-center mb-4" />
        <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'جاري التحقق...' : 'دخول'}</button>
        <Link to="/" className="block text-xs text-muted-foreground mt-5 hover:text-foreground">← العودة للمتجر</Link>
      </form>
    </div>
  );
};

const AdminPanel = () => {
  const qc = useQueryClient();
  const [logged, setLogged] = useState(() => !!auth.get());
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    document.title = 'لوحة التحكم';
    const onUnauthorized = () => { setLogged(false); toast.error('انتهت الجلسة، سجّل الدخول من جديد'); };
    window.addEventListener('admin-unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin-unauthorized', onUnauthorized);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api('/api/stats', { admin: true }),
    enabled: logged,
    refetchInterval: 60_000,
  });

  if (!logged) return <Login onSuccess={() => setLogged(true)} />;

  const logout = () => { auth.clear(); qc.clear(); setLogged(false); };
  const counts = { orders: stats?.pendingOrders, messages: stats?.newMessages };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0 lg:flex">
      {/* Sidebar (ديسكتوب) */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-foreground text-background p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <span className="w-9 h-9 rounded-xl bg-gradient-gold grid place-items-center"><Sparkles className="w-4 h-4 text-accent-foreground" /></span>
          <span className="font-extrabold">لوحة التحكم</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1" aria-label="أقسام اللوحة">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${tab === id ? 'bg-primary text-primary-foreground' : 'opacity-75 hover:opacity-100 hover:bg-background/10'}`}>
              <Icon className="w-4 h-4" />{label}
              {counts[id] > 0 && <span className="mr-auto bg-accent text-accent-foreground text-[10px] rounded-full px-1.5 py-0.5">{counts[id]}</span>}
            </button>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold opacity-75 hover:opacity-100"><ExternalLink className="w-4 h-4" />عرض المتجر</Link>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold opacity-75 hover:opacity-100"><LogOut className="w-4 h-4" />تسجيل خروج</button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold">لوحة التحكم</span>
          <div className="flex gap-1">
            <Link to="/" aria-label="عرض المتجر" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted"><ExternalLink className="w-4 h-4" /></Link>
            <button onClick={logout} aria-label="تسجيل خروج" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-5xl">
          <h1 className="text-2xl font-extrabold mb-5">{TABS.find((t) => t.id === tab)?.label}</h1>
          {tab === 'dashboard' && <DashboardTab go={setTab} />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Bottom nav (موبايل) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border grid grid-cols-5" aria-label="أقسام اللوحة">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold ${tab === id ? 'text-primary' : 'text-muted-foreground'}`}>
            <Icon className="w-5 h-5" />{label}
            {counts[id] > 0 && <span className="absolute top-1.5 right-1/2 translate-x-4 bg-destructive text-destructive-foreground text-[9px] rounded-full min-w-[16px] h-4 grid place-items-center">{counts[id]}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminPanel;
