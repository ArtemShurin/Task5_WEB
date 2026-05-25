import { createSlice } from '@reduxjs/toolkit'
import { loadProducts } from './productsSlice'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || []
  } catch {
    return []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart(state, action) {
      const product = action.payload
      const existing = state.items.find((i) => i.id === product.id)
      const currentQty = existing ? existing.qty : 0
      if (currentQty + 1 > product.stock) return
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({ ...product, qty: 1 })
      }
    },
    addToCartWithQty(state, action) {
      const { product, qty } = action.payload
      const existing = state.items.find((i) => i.id === product.id)
      const currentQty = existing ? existing.qty : 0
      if (currentQty + qty > product.stock) return
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({ ...product, qty })
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
    changeQty(state, action) {
      const { id, delta } = action.payload
      const item = state.items.find((i) => i.id === id)
      if (item) {
        item.qty = Math.min(item.stock, Math.max(1, item.qty + delta))
      }
    },
    clearCart(state) {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadProducts.fulfilled, (state, action) => {
      const productMap = new Map(action.payload.items.map((p) => [p.id, p]))
      state.items = state.items
        .filter((item) => productMap.has(item.id))
        .map((item) => {
          const current = productMap.get(item.id)
          return {
            ...item,
            name: current.name,
            price: current.price,
            image_url: current.image_url,
            stock: current.stock,
            qty: Math.min(item.qty, current.stock) || 1,
          }
        })
    })
  },
})

export const { addToCart, addToCartWithQty, removeFromCart, changeQty, clearCart } = cartSlice.actions
export default cartSlice.reducer
