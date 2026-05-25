import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, redirectTo = '/admin/login' }) {
  const token = useSelector((s) => s.admin.token)
  if (!token) return <Navigate to={redirectTo} replace />
  return children
}
