import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiGetOrders, apiGetOrderById, apiUpdateOrderStatus, apiDeleteOrder } from '../../api/admin'
import styles from './AdminOrders.module.css'

const STATUSES = ['created', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_LABELS = {
  created: 'Создан',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_STYLES = {
  created: styles.statusCreated,
  processing: styles.statusProcessing,
  shipped: styles.statusShipped,
  delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
}

export default function AdminOrders() {
  const token = useSelector((s) => s.admin.token)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [activeStatuses, setActiveStatuses] = useState(new Set())

  function toggleStatus(s) {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const visibleOrders = activeStatuses.size === 0
    ? orders
    : orders.filter((o) => activeStatuses.has(o.status))

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiGetOrders(token)
      setOrders(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function openDetail(orderId) {
    setDetailLoading(true)
    setDetail({ loading: true, order_id: orderId })
    try {
      const data = await apiGetOrderById(token, orderId)
      setDetail(data)
    } catch (e) {
      setDetail(null)
      alert(e.message)
    } finally {
      setDetailLoading(false)
    }
  }

  function openStatusModal(order) {
    setNewStatus(order.status || 'created')
    setStatusError('')
    setStatusModal(order)
  }

  async function handleStatusSave() {
    setStatusSaving(true)
    setStatusError('')
    try {
      await apiUpdateOrderStatus(token, statusModal.order_id, newStatus)
      const orderId = statusModal.order_id
      setStatusModal(null)
      load()
      if (detail && !detail.loading) {
        const updated = await apiGetOrderById(token, orderId)
        setDetail(updated)
      }
    } catch (e) {
      setStatusError(e.message)
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleDelete(orderId) {
    try {
      await apiDeleteOrder(token, orderId)
      setConfirmDelete(null)
      if (detail && !detail.loading && detail.id === orderId) setDetail(null)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Заказы</h1>
      </div>

      <div className={styles.filters}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => toggleStatus(s)}
            className={`${styles.filterBtn} ${STATUS_STYLES[s]} ${activeStatuses.has(s) ? styles.filterActive : ''}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        {activeStatuses.size > 0 && (
          <button className={styles.filterClear} onClick={() => setActiveStatuses(new Set())}>
            Сбросить
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.hint}>Загрузка...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Покупатель</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Дата оформления</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 && (
                <tr><td colSpan={6} className={styles.hint}>{orders.length === 0 ? 'Заказов нет' : 'Нет заказов с выбранными статусами'}</td></tr>
              )}
              {visibleOrders.map((o) => (
                <tr key={o.order_id}>
                  <td className={styles.orderNum}>#{o.order_number}</td>
                  <td>{o.user_name}</td>
                  <td>{o.email}</td>
                  <td>{o.phone}</td>
                  <td className={styles.dateCell}>{o.created_at || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_STYLES[o.status] || ''}`}>
                      {STATUS_LABELS[o.status] || o.status || '—'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.detailBtn} onClick={() => openDetail(o.order_id)}>Детали</button>
                      <button className={styles.statusBtn} onClick={() => openStatusModal(o)}>Статус</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(o)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {detail.loading ? (
              <p className={styles.hint}>Загрузка...</p>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Заказ #{detail.order_number}</h2>
                <div className={styles.detailGrid}>
                  <span className={styles.detailLabel}>Покупатель:</span><span>{detail.user_name}</span>
                  <span className={styles.detailLabel}>Email:</span><span>{detail.email}</span>
                  <span className={styles.detailLabel}>Телефон:</span><span>{detail.phone}</span>
                  <span className={styles.detailLabel}>Адрес:</span><span>{detail.address}</span>
                  <span className={styles.detailLabel}>Статус:</span>
                  <span className={`${styles.badge} ${STATUS_STYLES[detail.status] || ''}`}>
                    {STATUS_LABELS[detail.status] || detail.status}
                  </span>
                </div>

                {detail.items?.length > 0 && (
                  <>
                    <h3 className={styles.itemsTitle}>Позиции</h3>
                    <table className={styles.itemsTable}>
                      <thead>
                        <tr>
                          <th>Товар ID</th>
                          <th>Кол-во</th>
                          <th>Цена</th>
                          <th>Итого</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((item, i) => (
                          <tr key={i}>
                            <td className={styles.productId}>{item.product_id}</td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.price).toLocaleString('ru-RU')} ₽</td>
                            <td>{Number(item.total).toLocaleString('ru-RU')} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className={styles.total}>Итого: {Number(detail.total_price).toLocaleString('ru-RU')} ₽</div>
                  </>
                )}

                <button className={styles.cancelBtn} onClick={() => setDetail(null)}>Закрыть</button>
              </>
            )}
          </div>
        </div>
      )}

      {statusModal && (
        <div className={styles.overlay} onClick={() => setStatusModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Изменить статус заказа #{statusModal.order_number}</h2>

            {statusError && <p className={styles.formError}>{statusError}</p>}

            <div className={styles.statusOptions}>
              {STATUSES.map((s) => (
                <label key={s} className={`${styles.statusOption} ${newStatus === s ? styles.selectedOption : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={newStatus === s}
                    onChange={() => setNewStatus(s)}
                  />
                  <span className={`${styles.badge} ${STATUS_STYLES[s]}`}>{STATUS_LABELS[s]}</span>
                </label>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setStatusModal(null)}>Отмена</button>
              <button className={styles.saveBtn} onClick={handleStatusSave} disabled={statusSaving}>
                {statusSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Удалить заказ?</h2>
            <p className={styles.confirmText}>Заказ #{confirmDelete.order_number} будет удалён без возможности восстановления.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Отмена</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete.order_id)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
