// components/header.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, ShoppingBag, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const navigation = [
  { name: "Home", href: "/" },
  { name: "New Arrivals", href: "/products?new=true" },
  { name: "Sale", href: "/products?sale=true" },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { items } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" 
          : "bg-transparent",
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-background">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border py-4">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/logo.svg" 
                    alt="Noctael" 
                    className="h-8 w-auto filter invert dark:invert-0"
                  />
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-4">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block py-2 text-lg transition-colors hover:text-primary", 
                          pathname === item.href ? "font-medium text-primary" : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border py-4">
                <div className="flex flex-col space-y-2">
                  {!isAuthenticated && (
                    <>
                      <Link href="/auth/login" className="block py-2 text-lg hover:text-primary transition-colors">
                        Login
                      </Link>
                      <Link href="/auth/register" className="block py-2 text-lg hover:text-primary transition-colors">
                        Register
                      </Link>
                    </>
                  )}
                  <Link href="/account" className="flex items-center py-2 hover:text-primary transition-colors">
                    <User className="mr-2 h-5 w-5" />
                    My Account
                  </Link>
                  <Link href="/cart" className="flex items-center py-2 hover:text-primary transition-colors">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Cart ({items.length})
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo - centered on mobile, left-aligned on desktop */}
        <div className="flex-1 lg:flex-none">
          <Link href="/" className="flex items-center justify-center lg:justify-start">
            <img 
              src="/logo.svg" 
              alt="Noctael" 
              className="h-8 w-auto filter invert dark:invert-0"
            />
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:block">
          <ul className="flex space-x-8">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {isSearchOpen ? (
            <div className="absolute inset-x-0 top-0 z-10 flex h-16 items-center bg-background px-4 border-b border-border">
              <Input 
                type="search" 
                placeholder="Search for products..." 
                className="flex-1 bg-background border-input" 
                autoFocus 
              />
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)} className="ml-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          
          <div className="hidden lg:flex space-x-2">
            {!isAuthenticated && (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {items.length}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}