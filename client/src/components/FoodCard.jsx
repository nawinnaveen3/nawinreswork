import { ShoppingCart } from 'lucide-react';
import FoodImage from './FoodImage';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, onAdd }) {
  const { money } = useCart();
  return (
    <article className="card food">
      <FoodImage src={food.image} name={food.name} />
      <div className="food-body">
        <div className="row between">
          <h3>{food.name}</h3>
          <span className="price">{money(food.price)}</span>
        </div>
        {food.category_name && <span className="muted" style={{ fontSize: '.85rem' }}>{food.category_name}</span>}
        <p>{food.description}</p>
        <span style={{ fontSize: '.85rem' }}>
          <span className={`dot ${food.availability ? 'ok' : 'no'}`} />
          {food.availability ? 'Available' : 'Currently Unavailable'}
        </span>
        {onAdd && (
          <button className="btn btn-gold" disabled={!food.availability} onClick={() => onAdd(food)}>
            <ShoppingCart size={16} /> {food.availability ? 'Add to Cart' : 'Currently Unavailable'}
          </button>
        )}
      </div>
    </article>
  );
}
