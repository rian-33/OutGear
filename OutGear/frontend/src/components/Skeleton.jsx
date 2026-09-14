export function SkeletonCard() {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-img" />
      <div className="card-info">
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-60" />
        <div className="skeleton skeleton-line w-70" />
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="catalog-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}