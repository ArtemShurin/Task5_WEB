import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import { fetchProducts } from "../api/products";
import CartItem from "../components/CartItem";
import styles from "./Cart.module.css";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart.items);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const [checkoutError, setCheckoutError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleCheckout() {
    setChecking(true);
    setCheckoutError("");
    try {
      const freshProducts = await fetchProducts();
      const productIds = new Set(freshProducts.map((p) => p.id));
      const missing = cart.filter((item) => !productIds.has(item.id));
      if (missing.length > 0) {
        setCheckoutError(
          `Товар${missing.length > 1 ? "ы" : ""} не найден${missing.length > 1 ? "ы" : ""}: ${missing.map((i) => `«${i.name}»`).join(", ")}. Удалите из корзины перед оформлением.`
        );
        return;
      }
      navigate("/checkout");
    } catch {
      setCheckoutError("Не удалось проверить наличие товаров. Попробуйте снова.");
    } finally {
      setChecking(false);
    }
  }

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
          {checkoutError && (
            <p style={{ color: "#b91c1c", fontSize: "14px", marginBottom: "10px" }}>
              {checkoutError}
            </p>
          )}
          <div className={styles.summaryButtons}>
            <button className={styles.clear} onClick={() => dispatch(clearCart())}>
              Очистить
            </button>
            <button className={styles.checkout} onClick={handleCheckout} disabled={checking}>
              {checking ? "Проверка..." : "Оформить заказ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
