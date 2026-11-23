import ProductCard from './ProductCard.jsx';

const ProductGrid = ({ products, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) => (
  <div className={`grid ${cols} gap-3 sm:gap-5`}>
    {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
  </div>
);

export default ProductGrid;
