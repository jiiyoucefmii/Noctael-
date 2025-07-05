"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailChange } from "@/utils/api/users"; 
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyNewEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await verifyEmailChange(token);
        setStatus("success");
        setTimeout(() => router.push("/auth/login"), 2000);
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
      }
    };

    verify();
  }, [token, router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" />
              <p>Verifying your new email...</p>
            </div>
          )}
          {status === "success" && <p>Your new email has been verified. Redirecting to login...</p>}
          {status === "error" && <p className="text-red-500">Verification failed or token is invalid.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
