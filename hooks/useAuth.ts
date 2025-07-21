import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../utils/api/users";
import { useAdminAuth } from "./useAdminAuth";



export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const { admin } = useAdminAuth();


  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        const userObj = data?.user ?? data;
        if (isMounted) {
          if (!userObj || userObj === null) {
            setUser(null);
            setIsAuthenticated(false);
            setIsGuest(false);
          } else {
            setUser(userObj);
            setIsAuthenticated(true);
            setIsGuest(userObj?.is_guest || false);
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

  useEffect(() => {
    const shouldAutoLogout = isGuest && !user && !admin;
  
    if (!shouldAutoLogout) return;
  
    const handleUnload = () => {
      logoutUser();
    };
  
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [isGuest, user, admin]);
  
  return { user, isAuthenticated, setIsAuthenticated, isGuest, loading };
}