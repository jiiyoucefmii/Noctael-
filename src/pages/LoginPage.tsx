import { Link } from "react-router-dom"
<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import LoginForm from "../../components/login-form"
=======
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import LoginForm from "../components/login-form"
>>>>>>> master

export default function LoginPage() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>{" "}
              <Link to="/auth/register" className="font-medium text-black hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-black hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
