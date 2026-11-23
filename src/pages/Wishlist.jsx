import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const Wishlist = () => {
  const { items } = useWishlist();
  return (
    <Layout>
      <section className="container mx-auto px-4 mt-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">قائمة المفضلة فارغة</h2>
            <p className="text-muted-foreground mb-6">اضغط على القلب في أي منتج لحفظه هنا</p>
            <Link to="/products" className="btn-primary px-6 py-3">تصفح المنتجات</Link>
          </div>
        ) : (
          <>
            <SectionTitle subtitle={`${items.length} منتج`}>المفضلة</SectionTitle>
            <ProductGrid products={items} />
          </>
        )}
      </section>
    </Layout>
  );
};

export default Wishlist;
