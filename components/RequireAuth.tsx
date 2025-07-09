import { useAuth } from "../hooks/useAuth"
import { Navigate, useLocation } from "react-router-dom"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated || isGuest) return <Navigate to="/auth/login" state={{ from: location }} replace />
  return <>{children}</>
}
