import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromCart, changeQty } from "../store/cartSlice";
import styles from "./CartItem.module.css";

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className={styles.card}>
      <img
        className={styles.img}
        src={item.image_url || "https://via.placeholder.com/200x140?text=Товар"}
        alt={item.name}
      />

      <h3>{item.name}</h3>
      <p>{item.qty} × {item.price} $</p>
      <p className={item.stock > 0 ? styles.inStock : styles.outOfStock}>
        На складе: {item.stock} шт.
      </p>

      <div className={styles.qtyControls}>
        <button className={styles.plus} onClick={() => dispatch(changeQty({ id: item.id, delta: 1 }))}>+</button>
        <button className={styles.minus} onClick={() => dispatch(changeQty({ id: item.id, delta: -1 }))}>-</button>
      </div>

      <div className={styles.btnGroup}>
        <Link to={`/product/${item.id}`}>
          <button>К товару</button>
        </Link>
        <button className={styles.remove} onClick={() => dispatch(removeFromCart(item.id))}>
          Удалить
        </button>
      </div>
    </div>
  );
}
