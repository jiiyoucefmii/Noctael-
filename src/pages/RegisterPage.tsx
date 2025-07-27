'use client'

import dynamic from 'next/dynamic'
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../components/ui/card"

// Dynamically import RegisterForm with SSR disabled if needed
const RegisterForm = dynamic(() => import("../../components/register-form"), { ssr: false })

export default function RegisterPage() {
  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Enter your information to create a Noctael account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>{" "}
            <Link href="/auth/login" className="font-medium text-black hover:underline">
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
