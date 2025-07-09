"use client"
import { useAuth } from "../../hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!isAuthenticated || isGuest)) {
      router.replace("/auth/login")
    }
  }, [isAuthenticated, isGuest, loading, router])

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated || isGuest) return null
  return <>{children}</>
}
