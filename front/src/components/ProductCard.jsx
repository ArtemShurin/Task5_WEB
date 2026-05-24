import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className={styles.card}>
      <img
        className={styles.img}
        src={product.image_url || "https://via.placeholder.com/200x140?text=Товар"}
        alt={product.name}
      />

      <h3>{product.name}</h3>

      {product.categories?.length > 0 && (
        <div className={styles.badges}>
          {product.categories.map((c) => (
            <span key={c.id} className={styles.badge}>{c.name}</span>
          ))}
        </div>
      )}

      <p>{product.price} $</p>
      <p className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
        {product.stock > 0 ? `На складе: ${product.stock} шт.` : "Нет в наличии"}
      </p>

      <button onClick={() => onAddToCart(product)}>Купить</button>
      <br /><br />
      <Link to={`/product/${product.id}`}>Подробнее</Link>
    </div>
  );
}
