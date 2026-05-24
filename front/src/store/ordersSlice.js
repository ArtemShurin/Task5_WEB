import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createOrder, addItemToOrder } from '../api/orders'

export const placeOrder = createAsyncThunk(
  'orders/place',
  async ({ formData, cartItems }, { rejectWithValue }) => {
    try {
      const order = await createOrder({
        order_number: Math.floor(Date.now() / 1000),
        user_name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      })

      for (const item of cartItems) {
        await addItemToOrder(order.id, {
          product_id: item.id,
          quantity: item.qty,
        })
      }

      return {
        order_number: order.order_number,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    lastOrder: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetOrder(state) {
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastOrder = action.payload
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { resetOrder } = ordersSlice.actions
export default ordersSlice.reducer
