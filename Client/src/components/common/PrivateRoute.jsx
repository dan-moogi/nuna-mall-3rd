import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const PrivateRoute = ({ children }) => {
  const isLoggedIn  = useAuthStore((s) => s.isLoggedIn)
  const authLoading = useAuthStore((s) => s.authLoading)
  const location = useLocation()
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

export default PrivateRoute
