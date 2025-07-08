'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { confirmEmailChange } from "@/utils/api/users"
import { CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export default function VerifyChangeEmailRequestPage() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    confirmEmailChange(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [token])

  return (
    <main className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-[400px] shadow-2xl">
        <CardHeader>
          <CardTitle>Verify Email Change</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-2">
              <Spinner className="h-6 w-6 animate-spin" />
              <p>Verifying your request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-2 text-green-600">
              <CheckCircle className="h-10 w-10" />
              <p>Your email has been changed successfully.</p>
              <p className="text-sm text-muted-foreground">
                Please check your <strong>new email inbox</strong> to confirm and activate it.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-2 text-red-600">
              <XCircle className="h-10 w-10" />
              <p>Invalid or expired token. Please try again.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
