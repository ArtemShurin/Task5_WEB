import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProducts, fetchCategories } from '../api/products'

export const loadProducts = createAsyncThunk('products/loadAll', async () => {
  const [items, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  return { items, categories }
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetProductsStatus(state) {
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.categories = action.payload.categories
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { resetProductsStatus } = productsSlice.actions
export default productsSlice.reducer
