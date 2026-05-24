import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'
import ordersReducer from './ordersSlice'
import adminReducer from './adminSlice'

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    admin: adminReducer,
  },
})

store.subscribe(() => {
  localStorage.setItem('cart', JSON.stringify(store.getState().cart.items))
})

export default store
