import { useEffect, useState } from "react"
import axios from "axios"

interface Admin {
  id: string
  email: string
  name: string
  role: string
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchAdmin = async () => {
      try {
        const res = await axios.get<{ admin: Admin }>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://noctael.onrender.com"}/admin/me`,
          { withCredentials: true }
        )

        console.log("Admin data fetched:", res.data)

        if (isMounted && res.data?.admin) {
          setAdmin(res.data.admin)
          setIsAuthenticated(true)
        }
      } catch {
        if (isMounted) {
          setAdmin(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAdmin()
    return () => {
      isMounted = false
    }
  }, [])

  return { admin, isAuthenticated, loading }
}
