// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/providers/cart-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Noctael | Premium Clothing Brand",
  description: "Embrace the darkness with Noctael's premium clothing collection.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-[#0A0A0A]" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <div className="flex-1 bg-background">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}