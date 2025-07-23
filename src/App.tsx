// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import "./App.css"

import { CartProvider } from "../providers/cart-provider"
import { Toaster } from "../components/ui/toaster"
import Header from "../components/header"
import Footer from "../components/footer"
import RequireAdminAuth from "../components/RequireAdminAuth"

// Pages
import HomePage from "./pages/HomePage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AccountPage from "./pages/AccountPage"
import AdminPage from "./pages/AdminPage"

function App() {
  useEffect(() => {
    // Force dark mode on the root elements
    document.documentElement.style.backgroundColor = 'hsl(222.2 84% 4.9%)'
    document.documentElement.style.color = 'hsl(210 40% 98%)'
    document.body.style.backgroundColor = 'hsl(222.2 84% 4.9%)'
    document.body.style.color = 'hsl(210 40% 98%)'
    document.body.style.minHeight = '100vh'
    
    // Add dark class to html for Tailwind dark mode
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }, [])

  return (
    <div style={{ backgroundColor: 'hsl(222.2 84% 4.9%)', color: 'hsl(210 40% 98%)', minHeight: '100vh' }}>
      <CartProvider>
        <Router>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1 bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAdminAuth>
                      <AdminPage />
                    </RequireAdminAuth>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </CartProvider>
    </div>
  )
}

export default App