import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items } = useWishlist();
  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">قائمة المفضلة فارغة</h2>
            <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
            <Link to="/products" className="inline-flex px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <SectionTitle subtitle={`${items.length} منتج`}>❤️ المفضلة</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
          </>
        )}
      </section>
    </Layout>
  );
};

export default Wishlist;
