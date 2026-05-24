import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import CartItem from "../components/CartItem";
import styles from "./Cart.module.css";

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="container">
      <div className={styles.topLeft}>
        <Link to="/"><button className={styles.btnSmall}>В каталог</button></Link>
      </div>

      <h1 className="center">Корзина</h1>

      {cart.length === 0 && <h3 className="center">Пусто</h3>}

      <div className={styles.grid}>
        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {cart.length > 0 && (
        <div className={styles.summary}>
          <h2>Итого: {total.toFixed(2)} $</h2>
          <div className={styles.summaryButtons}>
            <button className={styles.clear} onClick={() => dispatch(clearCart())}>
              Очистить
            </button>
            <Link to="/checkout">
              <button className={styles.checkout}>Оформить заказ</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
