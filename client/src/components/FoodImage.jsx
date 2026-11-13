export default function FoodImage({ src, name, className = 'food-img' }) {
  if (!src) return <div className="food-ph" aria-hidden="true">{(name || '?').charAt(0).toUpperCase()}</div>;
  return <img className={className} src={src} alt={name} loading="lazy" />;
}
