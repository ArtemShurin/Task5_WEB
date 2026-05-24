const BASE = '/api/reviews'

export async function fetchReviewsByProduct(productId) {
  const res = await fetch(`${BASE}/by_product/${productId}`)
  if (!res.ok) throw new Error('Не удалось загрузить отзывы')
  return res.json()
}

export async function createReview(data) {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Не удалось добавить отзыв')
  }
  return res.json()
}
