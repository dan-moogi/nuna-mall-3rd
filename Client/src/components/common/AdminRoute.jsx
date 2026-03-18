import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuthStore((s) => s)
  if (!isLoggedIn || user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default AdminRoute
