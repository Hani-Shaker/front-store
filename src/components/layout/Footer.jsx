import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="bg-foreground text-background mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold">أناقة ستور</span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            متجرك المفضل للأزياء والاكسسوارات بأفضل الأسعار وأحدث الصيحات.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 text-gradient-gold inline-block">روابط سريعة</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">الرئيسية</Link>
            <Link to="/products" className="text-sm opacity-70 hover:opacity-100 transition-opacity">المنتجات</Link>
            <Link to="/wishlist" className="text-sm opacity-70 hover:opacity-100 transition-opacity">المفضلة</Link>
            <Link to="/contact" className="text-sm opacity-70 hover:opacity-100 transition-opacity">اتصل بنا</Link>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 text-gradient-gold inline-block">تواصل معنا</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Phone className="w-4 h-4" /><span>+20 123 456 7890</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Mail className="w-4 h-4" /><span>info@anaqastore.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <MapPin className="w-4 h-4" /><span>القاهرة، مصر</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-10 pt-6 text-center">
        <p className="text-xs opacity-50">© {new Date().getFullYear()} أناقة ستور. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
