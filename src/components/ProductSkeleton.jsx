const ProductSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="skeleton aspect-square rounded-none" />
        <div className="p-4 space-y-3">
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-5 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductSkeleton;
