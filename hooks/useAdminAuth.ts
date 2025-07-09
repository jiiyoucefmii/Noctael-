import { useEffect, useState } from "react"
import axios from "axios"

export function useAdminAuth() {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/admin/me`, { withCredentials: true })
      .then((res) => {
        if (isMounted) {
          setAdmin(res.data.admin || res.data)
          setIsAuthenticated(true)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAdmin(null)
          setIsAuthenticated(false)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  return { admin, isAuthenticated, loading }
}
