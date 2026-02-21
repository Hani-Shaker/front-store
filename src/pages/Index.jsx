import Layout from '../components/layout/Layout.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { getSliderProducts, getDiscountedProducts, getNewProducts } from '../data/products.js';

const Index = () => {
  const sliderProducts = getSliderProducts();
  const discountedProducts = getDiscountedProducts();
  const newProducts = getNewProducts();

  return (
    <Layout>
      <section className="container mx-auto px-4 mt-6">
        <HeroSlider products={sliderProducts} />
      </section>

      <section className="container mx-auto px-4 mt-14">
        <SectionTitle subtitle="لا تفوت الفرصة!">🔥 عروض مميزة</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {discountedProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-14">
        <SectionTitle subtitle="أحدث ما أضفناه">✨ وصل حديثاً</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
