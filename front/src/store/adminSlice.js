import { createSlice } from '@reduxjs/toolkit'

function loadToken() {
  return localStorage.getItem('admin_token') || null
}

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    token: loadToken(),
    username: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token
      state.username = action.payload.username
      localStorage.setItem('admin_token', action.payload.token)
    },
    logout(state) {
      state.token = null
      state.username = null
      localStorage.removeItem('admin_token')
    },
  },
})

export const { loginSuccess, logout } = adminSlice.actions
export default adminSlice.reducer
