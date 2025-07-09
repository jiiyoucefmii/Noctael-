import { useAdminAuth } from "../hooks/useAdminAuth"
import { Navigate, useLocation } from "react-router-dom"

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: location }} replace />
  return <>{children}</>
}
