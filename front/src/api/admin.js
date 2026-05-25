function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function apiLogin(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Неверный логин или пароль')
  return res.json()
}

export async function apiGetCategories(token) {
  const res = await fetch('/api/categories/get_all', { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Ошибка загрузки категорий')
  return res.json()
}

export async function apiCreateCategory(token, data) {
  const res = await fetch('/api/admin/categories/create', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка создания категории')
  }
  return res.json()
}

export async function apiUpdateCategory(token, id, data) {
  const res = await fetch(`/api/admin/categories/${id}/update`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка обновления категории')
  }
  return res.json()
}

export async function apiDeleteCategory(token, id) {
  const res = await fetch(`/api/admin/categories/${id}/delete`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Ошибка удаления категории')
}

export async function apiGetCategoryProducts(token, categoryId) {
  const res = await fetch(`/api/categories/${categoryId}/get_by_id`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Ошибка загрузки товаров категории')
  return res.json()
}

export async function apiAddProductToCategory(token, categoryId, productId) {
  const res = await fetch(`/api/admin/categories/${categoryId}/${productId}/add`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка добавления товара')
  }
}

export async function apiRemoveProductFromCategory(token, categoryId, productId) {
  const res = await fetch(`/api/admin/categories/${categoryId}/product/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка удаления товара из категории')
  }
}

export async function apiGetProducts(token) {
  const res = await fetch('/api/products/get_all', { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Ошибка загрузки товаров')
  return res.json()
}

export async function apiCreateProduct(token, data) {
  const res = await fetch('/api/admin/products/create', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка создания товара')
  }
  return res.json()
}

export async function apiUpdateProduct(token, id, data) {
  const res = await fetch(`/api/admin/products/${id}/update`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка обновления товара')
  }
  return res.json()
}

export async function apiDeleteProduct(token, id) {
  const res = await fetch(`/api/admin/products/${id}/delete`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Ошибка удаления товара')
}

export async function apiGetReviewsByProduct(productId) {
  const res = await fetch(`/api/reviews/by_product/${productId}`)
  if (!res.ok) throw new Error('Ошибка загрузки отзывов')
  return res.json()
}

export async function apiDeleteReview(token, reviewId) {
  const res = await fetch(`/api/admin/reviews/${reviewId}/delete`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Ошибка удаления отзыва')
}

export async function apiUpdateReview(token, reviewId, data) {
  const res = await fetch(`/api/admin/reviews/${reviewId}/update`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка обновления отзыва')
  }
  return res.json()
}

export async function apiGetOrders(token) {
  const res = await fetch('/api/admin/orders/get_all', { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Ошибка загрузки заказов')
  return res.json()
}

export async function apiGetOrderById(token, id) {
  const res = await fetch(`/api/admin/orders/${id}/get_by_id`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Ошибка загрузки заказа')
  return res.json()
}

export async function apiDeleteOrder(token, id) {
  const res = await fetch(`/api/admin/orders/${id}/delete`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Ошибка удаления заказа')
}

export async function apiUpdateOrderStatus(token, id, status) {
  const res = await fetch(`/api/admin/orders/${id}/update_status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Ошибка обновления статуса')
  }
  return res.json()
}
