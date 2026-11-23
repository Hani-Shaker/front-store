import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

const Footer = () => {
  const s = useSettings();
  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/wishlist', label: 'المفضلة' },
    { to: '/cart', label: 'السلة' },
    { to: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gradient-gold grid place-items-center">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </span>
              <span className="text-lg font-extrabold">{s.storeName}</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">{s.tagline}</p>
            <div className="flex gap-2 mt-5">
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="إنستجرام" className="w-9 h-9 rounded-full bg-background/10 hover:bg-background/20 grid place-items-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {s.facebook && (
                <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك" className="w-9 h-9 rounded-full bg-background/10 hover:bg-background/20 grid place-items-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-gradient-gold inline-block">روابط سريعة</h4>
            <div className="flex flex-col gap-2.5">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="text-sm opacity-70 hover:opacity-100 transition-opacity w-fit">{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-gradient-gold inline-block">تواصل معنا</h4>
            <div className="flex flex-col gap-3 text-sm opacity-80">
              <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:opacity-100"><Phone className="w-4 h-4" /><span dir="ltr">{s.phone}</span></a>
              <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:opacity-100"><Mail className="w-4 h-4" /><span>{s.email}</span></a>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{s.address}</span></div>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-10 pt-6 text-center">
          <p className="text-xs opacity-50">© {new Date().getFullYear()} {s.storeName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
