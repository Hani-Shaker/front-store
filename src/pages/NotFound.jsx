import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-8xl font-extrabold text-primary mb-4">404</h1>
    <h2 className="text-2xl font-bold text-foreground mb-2">الصفحة غير موجودة</h2>
    <p className="text-muted-foreground mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
    <Link to="/" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
      العودة للرئيسية
    </Link>
  </div>
);

export default NotFound;
