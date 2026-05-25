import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginSuccess } from '../../store/adminSlice'
import { apiLogin } from '../../api/admin'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(username, password)
      dispatch(loginSuccess({ token: data.access_token, username }))
      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Вход в администрацию</h1>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label}>
          Логин
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className={styles.label}>
          Пароль
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <button className={styles.backBtn} type="button" onClick={() => navigate('/')}>
          На главную
        </button>
      </form>
    </div>
  )
}
