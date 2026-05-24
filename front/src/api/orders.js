const BASE = '/api/orders'

export async function createOrder(data) {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = Array.isArray(err.detail)
      ? err.detail.map((e) => e.msg).join(', ')
      : err.detail || 'Не удалось создать заказ'
    throw new Error(detail)
  }

  return res.json()
}

export async function addItemToOrder(orderId, item) {
  const res = await fetch(`${BASE}/${orderId}/add_item`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Не удалось добавить товар в заказ')
  }
  return res.json()
}
