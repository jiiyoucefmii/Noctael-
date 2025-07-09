"use client"
import React from "react"
import RequireAuth from "./RequireAuth"
import { usePathname } from "next/navigation"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Skip RequireAuth for verification page
  if (pathname === "/account/verify-email") {
    return <>{children}</>
  }
  return <RequireAuth>{children}</RequireAuth>
}
