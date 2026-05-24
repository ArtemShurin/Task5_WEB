import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory,
  apiGetCategoryProducts, apiGetProducts, apiAddProductToCategory, apiRemoveProductFromCategory,
} from '../../api/admin'
import styles from './AdminProducts.module.css'
import catStyles from './AdminCategories.module.css'

const EMPTY_FORM = { name: '', description: '' }

export default function AdminCategories() {
  const token = useSelector((s) => s.admin.token)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  // состояние модала управления товарами
  const [productsModal, setProductsModal] = useState(null) // { category }
  const [allProducts, setAllProducts] = useState([])
  const [categoryProductIds, setCategoryProductIds] = useState(new Set())
  const [productsLoading, setProductsLoading] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [productSearch, setProductSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await apiGetCategories(token))
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

  function openEdit(cat) {
    setForm({ name: cat.name, description: cat.description })
    setFormError('')
    setEditing(cat)
    setModal('edit')
  }

  function closeModal() { setModal(null); setEditing(null) }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description.trim() }
    try {
      modal === 'create'
        ? await apiCreateCategory(token, payload)
        : await apiUpdateCategory(token, editing.id, payload)
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
      await apiDeleteCategory(token, id)
      setConfirmDelete(null)
      load()
    } catch (e) {
      alert(e.message)
    }
  }

  async function openProductsModal(cat) {
    setProductsModal({ category: cat })
    setProductSearch('')
    setProductsLoading(true)
    try {
      const [all, inCat] = await Promise.all([
        apiGetProducts(token),
        apiGetCategoryProducts(token, cat.id),
      ])
      setAllProducts(all)
      setCategoryProductIds(new Set(inCat.map((p) => p.id)))
    } catch (e) {
      alert(e.message)
    } finally {
      setProductsLoading(false)
    }
  }

  async function toggleProduct(productId) {
    if (!productsModal) return
    setTogglingId(productId)
    try {
      if (categoryProductIds.has(productId)) {
        await apiRemoveProductFromCategory(token, productsModal.category.id, productId)
        setCategoryProductIds((prev) => { const s = new Set(prev); s.delete(productId); return s })
      } else {
        await apiAddProductToCategory(token, productsModal.category.id, productId)
        setCategoryProductIds((prev) => new Set([...prev, productId]))
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setTogglingId(null)
    }
  }

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Категории</h1>
        <input
          className={styles.search}
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={openCreate}>+ Добавить категорию</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.hint}>Загрузка...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <tr><td colSpan={3} className={styles.hint}>Категорий не найдено</td></tr>
              )}
              {categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((cat) => (
                <tr key={cat.id}>
                  <td><div className={styles.productName}>{cat.name}</div></td>
                  <td><div className={styles.productDesc}>{cat.description}</div></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={catStyles.productsBtn} onClick={() => openProductsModal(cat)}>Товары</button>
                      <button className={styles.editBtn} onClick={() => openEdit(cat)}>Изменить</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(cat)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модал создания / редактирования */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{modal === 'create' ? 'Новая категория' : 'Редактировать категорию'}</h2>
            {formError && <p className={styles.formError}>{formError}</p>}
            <form className={styles.form} onSubmit={handleSave}>
              <label className={styles.field}>
                Название
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                Описание
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className={styles.textarea}
                  rows={3}
                />
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

      {/* Модал управления товарами категории */}
      {productsModal && (
        <div className={styles.overlay} onClick={() => setProductsModal(null)}>
          <div className={catStyles.productsModalInner} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              Товары в категории «{productsModal.category.name}»
            </h2>

            <input
              className={catStyles.search}
              placeholder="Поиск товара..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />

            {productsLoading ? (
              <p className={styles.hint}>Загрузка...</p>
            ) : (
              <div className={catStyles.productList}>
                {filteredProducts.length === 0 && (
                  <p className={styles.hint}>Товаров не найдено</p>
                )}
                {filteredProducts.map((p) => {
                  const inCat = categoryProductIds.has(p.id)
                  const toggling = togglingId === p.id
                  return (
                    <div key={p.id} className={`${catStyles.productRow} ${inCat ? catStyles.inCategory : ''}`}>
                      <div className={catStyles.productInfo}>
                        <div>
                          <div className={catStyles.productName}>{p.name}</div>
                          <div className={catStyles.productMeta}>
                            <span>Цена: {Number(p.price).toLocaleString('ru-RU')} ₽</span>
                            <span>Остаток: {p.stock}</span>
                          </div>
                          <div className={catStyles.productId}>ID: {p.id}</div>
                        </div>
                      </div>
                      <button
                        className={inCat ? catStyles.removeBtn : catStyles.addBtn}
                        onClick={() => toggleProduct(p.id)}
                        disabled={togglingId === p.id}
                      >
                        {togglingId === p.id ? '...' : inCat ? 'Убрать' : 'Добавить'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setProductsModal(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Удалить категорию?</h2>
            <p className={styles.confirmText}>«{confirmDelete.name}» будет удалена без возможности восстановления.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Отмена</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(confirmDelete.id)}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
