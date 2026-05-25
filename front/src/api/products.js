const BASE = '/api/products'
const CATEGORIES_BASE = '/api/categories'

export async function fetchProducts() {
  const res = await fetch(`${BASE}/get_all`)
  if (!res.ok) throw new Error('Не удалось загрузить товары')
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch(`${CATEGORIES_BASE}/get_all`)
  if (!res.ok) throw new Error('Не удалось загрузить категории')
  return res.json()
}
