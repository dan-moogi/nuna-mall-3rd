import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

export default PrivateRoute
