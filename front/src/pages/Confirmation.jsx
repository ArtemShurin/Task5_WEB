import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./Confirmation.module.css";

export default function Confirmation() {
  const order = useSelector((state) => state.orders.lastOrder);

  return (
    <div className="container center">
      <h1>✅ Заказ принят</h1>

      <div className={styles.card}>
        {order?.order_number && (
          <p><b>Номер заказа:</b> #{order.order_number}</p>
        )}
        <p><b>ФИО:</b> {order?.name}</p>
        <p><b>Телефон:</b> {order?.phone}</p>
        <p><b>Email:</b> {order?.email}</p>
        <p><b>Адрес:</b> {order?.address}</p>
      </div>

      <br />

      <Link to="/">
        <button className={styles.btnSmall}>Вернуться в каталог</button>
      </Link>
    </div>
  );
}
