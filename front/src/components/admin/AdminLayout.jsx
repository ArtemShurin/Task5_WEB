import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/adminSlice'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Админ-панель</div>
        <nav className={styles.nav}>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            Товары
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            Категории
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            Заказы
          </NavLink>
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
