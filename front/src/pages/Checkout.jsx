import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder, resetOrder } from "../store/ordersSlice";
import { clearCart } from "../store/cartSlice";
import { loadProducts } from "../store/productsSlice";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);
  const { status, error } = useSelector((state) => state.orders);

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    dispatch(resetOrder());
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.address) {
      setValidationError("Заполните все поля");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError("Некорректный email");
      return;
    }
    if (cartItems.length === 0) {
      setValidationError("Корзина пуста");
      return;
    }
    setValidationError("");

    const result = await dispatch(placeOrder({ formData: form, cartItems }));

    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(loadProducts());
      navigate("/confirmation");
    }
  };

  const displayError = validationError || error;

  return (
    <div className="container center">
      <div className={styles.topLeft}>
        <Link to="/cart">
          <button className={styles.btnSmall}>В корзину</button>
        </Link>
      </div>

      <h1>Оформление заказа</h1>

      <div className={styles.card}>
        <input
          placeholder="ФИО"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Адрес"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <br /><br />

        {displayError && <p style={{ color: "red" }}>{displayError}</p>}

        <button onClick={handleSubmit} disabled={status === "loading"}>
          {status === "loading" ? "Оформляем..." : "Подтвердить заказ"}
        </button>
      </div>
    </div>
  );
}
