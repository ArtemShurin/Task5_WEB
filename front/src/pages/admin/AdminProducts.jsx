import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import AdminLayout from '../../components/admin/AdminLayout'
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiGetReviewsByProduct, apiDeleteReview, apiUpdateReview } from '../../api/admin'
import styles from './AdminProducts.module.css'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', image_url: '' }

export default function AdminProducts() {
  const token = useSelector((s) => s.admin.token)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const [reviewsModal, setReviewsModal] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
  const [confirmDeleteReview, setConfirmDeleteReview] = useState(null)

  const [editingReview, setEditingReview] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', rate: 5 })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiGetProducts(token)
      setProducts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditing(null)
    setModal('create')
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || '',
    })
    setFormError('')
    setEditing(product)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      image_url: form.image_url.trim(),
    }
    try {
      if (modal === 'create') {
        await apiCreateProduct(token, payload)
      } else {
        await apiUpdateProduct(token, editing.id, payload)
      }
      closeModal()
      load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await apiDeleteProduct(token, id)
      setConfirmDelete(null)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  async function openReviewsModal(product) {
    setReviewsModal(product)
    setReviews([])
    setReviewsLoading(true)
    try {
      const data = await apiGetReviewsByProduct(product.id)
      setReviews(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setReviewsLoading(false)
    }
  }

  function openEditReview(review) {
    setEditForm({ name: review.name, description: review.description, rate: review.rate })
    setEditError('')
    setEditingReview(review)
  }

  async function handleEditSave() {
    if (editForm.rate < 1 || editForm.rate > 5) {
      setEditError('Оценка должна быть от 1 до 5')
      return
    }
    setEditSaving(true)
    setEditError('')
    try {
      const updated = await apiUpdateReview(token, editingReview.id, editForm)
      setReviews((prev) => prev.map((r) => r.id === editingReview.id ? { ...r, ...updated } : r))
      setEditingReview(null)
    } catch (e) {
      setEditError(e.message)
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    setDeletingReviewId(reviewId)
    try {
      await apiDeleteReview(token, reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeletingReviewId(null)
    }
  }

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Товары</h1>
        <input
          className={styles.search}
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={openCreate}>+ Добавить товар</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.hint}>Загрузка...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Изображение</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr><td colSpan={6} className={styles.hint}>Товаров не найдено</td></tr>
              )}
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td><span className={styles.idCell}>{p.id}</span></td>
                  <td>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productDesc}>{p.description?.slice(0, 60)}{p.description?.length > 60 ? '…' : ''}</div>
                  </td>
                  <td>{Number(p.price).toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span className={p.stock === 0 ? styles.outOfStock : styles.inStock}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.image_url
                      ? <img className={styles.thumb} src={p.image_url} alt="" />
                      : <span className={styles.noImg}>нет</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.reviewsBtn} onClick={() => openReviewsModal(p)}>Отзывы</button>
                      <button className={styles.editBtn} onClick={() => openEdit(p)}>Изменить</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(p)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{modal === 'create' ? 'Новый товар' : 'Редактировать товар'}</h2>

            {formError && <p className={styles.formError}>{formError}</p>}

            <form className={styles.form} onSubmit={handleSave}>
              <label className={styles.field}>
                Название
                <input name="name" value={form.name} onChange={handleFormChange} required className={styles.input} />
              </label>
              <label className={styles.field}>
                Описание
                <textarea name="description" value={form.description} onChange={handleFormChange} required className={styles.textarea} rows={3} />
              </label>
              <div className={styles.row}>
                <label className={styles.field}>
                  Цена (₽)
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleFormChange} required className={styles.input} />
                </label>
                <label className={styles.field}>
                  Остаток
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} required className={styles.input} />
                </label>
              </div>
              <label className={styles.field}>
                URL изображения
                <input name="image_url" value={form.image_url} onChange={handleFormChange} className={styles.input} placeholder="https://..." />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Отмена</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Удалить товар?</h2>
            <p className={styles.confirmText}>«{confirmDelete.name}» будет удалён без возможности восстановления.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Отмена</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete.id)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
      {reviewsModal && (
        <div className={styles.overlay} onClick={() => setReviewsModal(null)}>
          <div className={styles.reviewsModalInner} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Отзывы: {reviewsModal.name}</h2>

            {reviewsLoading ? (
              <p className={styles.hint}>Загрузка...</p>
            ) : reviews.length === 0 ? (
              <p className={styles.hint}>Отзывов нет</p>
            ) : (
              <div className={styles.reviewList}>
                {reviews.map((r) => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{r.user_name}</span>
                      <span className={styles.reviewDate}>
                        {new Date(r.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className={styles.reviewTitle}>{r.name}</div>
                    <div className={styles.reviewDesc}>{r.description}</div>
                    <span className={styles.reviewStars}>
                      {(() => { const rate = Math.min(5, Math.max(0, r.rate)); return '★'.repeat(rate) + '☆'.repeat(5 - rate) })()}
                    </span>
                    <div className={styles.reviewFooter}>
                      <button className={styles.editBtn} onClick={() => openEditReview(r)}>Изменить</button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setConfirmDeleteReview(r)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setReviewsModal(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteReview && (
        <div className={styles.overlay} onClick={() => setConfirmDeleteReview(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Удалить отзыв?</h2>
            <p className={styles.confirmText}>
              Отзыв от «{confirmDeleteReview.user_name}» будет удалён без возможности восстановления.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDeleteReview(null)}>Отмена</button>
              <button
                className={styles.deleteConfirmBtn}
                disabled={deletingReviewId === confirmDeleteReview.id}
                onClick={async () => {
                  await handleDeleteReview(confirmDeleteReview.id)
                  setConfirmDeleteReview(null)
                }}
              >
                {deletingReviewId === confirmDeleteReview.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingReview && (
        <div className={styles.overlay} onClick={() => setEditingReview(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Редактировать отзыв</h2>
            {editError && <p className={styles.formError}>{editError}</p>}
            <div className={styles.form}>
              <label className={styles.field}>
                Заголовок
                <input
                  className={styles.input}
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                Текст отзыва
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                Оценка (1–5)
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.rate}
                  onChange={(e) => {
                    const val = Math.min(5, Math.max(1, Number(e.target.value) || 1))
                    setEditForm((f) => ({ ...f, rate: val }))
                  }}
                />
              </label>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setEditingReview(null)}>Отмена</button>
                <button className={styles.saveBtn} onClick={handleEditSave} disabled={editSaving}>
                  {editSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
