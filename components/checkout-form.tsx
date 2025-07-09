"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/utils/api/users"
import { getUserAddresses, Address } from "@/utils/api/addresses"
import { createOrder } from "@/utils/api/orders"
import { getCart, clearCart, Cart } from "@/utils/api/cart"
import Link from "next/link"

export interface CheckoutData {
  user_id: string;
  shipping_address_id: string;
  cart_id: string;
}

export default function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [cart, setCart] = useState<Cart | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: ""
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [userData, cartData] = await Promise.all([
          getCurrentUser(),
          getCart()
        ])
        console.log(userData)
        console.log(cartData)
        
        setUser(userData)
        setCart(cartData)

        if (!cartData?.items?.length) {
          toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before checkout",
            variant: "destructive"
          })
          router.push('/cart')
          return
        }

        if (userData) {
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone_number || ""
          }))
          
          const userAddresses = await getUserAddresses()
          setAddresses(userAddresses.addresses || [])
          
          const defaultAddress = userAddresses.addresses.find((addr: Address) => addr.is_default)
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id || "")
            setFormData(prev => ({
              ...prev,
              address: defaultAddress.address || "",
              city: defaultAddress.city || "",
              state: defaultAddress.state || "",
              zip: defaultAddress.zip || ""
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load checkout data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddress = addresses.find(addr => addr.id === addressId)
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.address || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        zip: selectedAddress.zip || ""
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Cart ID being sent to backend:", cart?.cart_id);
  
    if (!cart?.items?.length) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      router.push('/cart');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const orderData: CheckoutData = {
        user_id: user.id,
        shipping_address_id: selectedAddressId,
        cart_id: cart.cart_id
      };
  
      const response = await createOrder(orderData);
      
      // The backend already clears the cart, so we just need to update local state
      setCart(null); // Clear local cart state
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${response.order.id} has been received.`,
      });
      
      router.push(`/order-confirmation?orderId=${response.order.id}`);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your order.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>We'll use this information to contact you about your order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Enter the address where you want your order delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && addresses.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Addresses</Label>
                <Select 
                  value={selectedAddressId} 
                  onValueChange={handleAddressChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id || ""}>
                        {address.name} - {address.address}, {address.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
              <Input 
                id="address2" 
                value={formData.address2} 
                onChange={handleInputChange} 
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input 
                  id="zip" 
                  value={formData.zip} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !cart?.items?.length || !selectedAddressId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order (${cart?.items?.length || 0} items)`
            )}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}