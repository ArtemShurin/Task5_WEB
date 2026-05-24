import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <div className={styles.header}>
      <Link to="/admin/login" className={styles.adminBtn}>Вход для администраторов</Link>
      <Link to="/cart" className={styles.cartBtn}>🛒 Корзина</Link>
    </div>
  );
}
