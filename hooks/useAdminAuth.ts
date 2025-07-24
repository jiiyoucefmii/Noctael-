import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "@/utils/api/config"

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
          `${API_URL}/admin/me`,
          { withCredentials: true }
        )


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
