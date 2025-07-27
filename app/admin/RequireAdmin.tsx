"use client"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  // Temporarily disabled authentication check
  // const { isAuthenticated, loading } = useAdminAuth()
  // const router = useRouter()

  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.replace("/auth/login")
  //   }
  // }, [isAuthenticated, loading, router])

  // if (loading) return <div>Loading...</div>
  // if (!isAuthenticated) return null
  
  // Temporarily allow direct access
  return <>{children}</>
}
