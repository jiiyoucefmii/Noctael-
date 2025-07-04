import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import RegisterForm from "../../components/register-form"


export default function RegisterPage() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your information to create a Noctael account</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>{" "}
            <Link to="/auth/login" className="font-medium text-black hover:underline">
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
