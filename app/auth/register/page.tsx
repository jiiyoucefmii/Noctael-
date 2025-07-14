import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForm from "@/components/register-form"

export const metadata: Metadata = {
  title: "Register | Noctael",
  description: "Create a new Noctael account.",
}

export default function RegisterPage() {
  return (
    <main className="flex-1 py-10">
      <div className="container max-w-md">
       <Card className="bg-[#171717] rounded-[5px] border-0">
           <CardHeader className="space-y-1">
             <CardTitle className="text-2xl">Create an Account</CardTitle>
             <CardDescription>Enter your information to create a Noctael account</CardDescription>
           </CardHeader>
           <CardContent>
             <RegisterForm />
           </CardContent>
           <CardFooter className="text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>{" "}
            <Link href="/auth/login" className="font-medium text-white hover:underline">
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
