import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';

const NotFound = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center text-center px-4 py-24">
      <h1 className="text-8xl font-black text-gradient-gold mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-2">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
      <Link to="/" className="btn-primary px-6 py-3">العودة للرئيسية</Link>
    </div>
  </Layout>
);

export default NotFound;
