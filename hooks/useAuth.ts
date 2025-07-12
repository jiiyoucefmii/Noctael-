import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/api/users";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        if (isMounted) {
          if (!data) {
            setUser(null);
            setIsAuthenticated(false);
            setIsGuest(false);
          } else {
            setUser(data.user || data);
            setIsAuthenticated(true);
            setIsGuest(data?.user?.is_guest || data?.is_guest || false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsGuest(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => { 
      isMounted = false;
    };
  }, []);

  return { user, isAuthenticated,setIsAuthenticated, isGuest, loading };
}