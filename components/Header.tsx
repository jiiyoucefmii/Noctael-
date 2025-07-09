import { useAuth } from "../hooks/useAuth"

export default function Header() {
  const { isAuthenticated, isGuest } = useAuth()

  return (
    <header>
      <nav>
        {!isAuthenticated && !isGuest && (
          <>
            <Button asChild>
              <Link to="/auth/login">Log In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth/register">Register</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
