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
import { getUserAddresses, Address, createAddress } from "@/utils/api/addresses"
import { createOrder } from "@/utils/api/orders"
import { useCart } from "@/hooks/use-cart"

export interface CheckoutData {
  user_id: string;
  shipping_address_id: string;
  cart_id: string;
  discount_code?: string;
  discount_amount?: number;
  subtotal: number;
  total: number;
}

export default function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [allAddresses, setAllAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Algeria" // Fixed to Algeria
  })
  const router = useRouter()
  const { toast } = useToast()
  const { 
    items, 
    cart_id, 
    discount,
    subtotal, // <-- make sure you get this from cart context, and it's updated after promo
    total,    // <-- same as above
    clearCart,
    isLoading: isCartLoading 
  } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userData = await getCurrentUser()
        
        if (!userData) {
          toast({
            title: "Authentication required",
            description: "Please sign in to proceed with checkout",
            variant: "destructive"
          })
          router.push('/login')
          return
        }

        setUser(userData)

        if (!items.length) {
          toast({
            title: "Your cart is empty",
            description: "Please add items to your cart before checkout",
            variant: "destructive"
          })
          router.push('/cart')
          return
        }

        setFormData(prev => ({
          ...prev,
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone_number || ""
        }))
        
        const userAddresses = await getUserAddresses()
        setAllAddresses(userAddresses.addresses || [])
        
        const defaultAddress = userAddresses.addresses.find((addr: Address) => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id || "")
          setFormData(prev => ({
            ...prev,
            address: defaultAddress.address || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            zip: defaultAddress.zip || "",
          }))
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
  }, [items, router, toast])

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddress = allAddresses.find(addr => addr.id === addressId)
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.address || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        zip: selectedAddress.zip || "",
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

  const findExistingAddress = (): string | null => {
    const { address, city, state, zip } = formData;
    const found = allAddresses.find(addr => 
      addr.address === address &&
      addr.city === city &&
      addr.state === state &&
      addr.zip === zip
    );
    return found ? found.id : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!items.length) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    if (!cart_id) {
      toast({
        title: "Invalid cart session",
        description: "Your cart could not be found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.address) {
      toast({
        title: "Shipping address required",
        description: "Please enter a shipping address",
        variant: "destructive"
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      // First check if we have a selected address
      let addressId = selectedAddressId;

      // If no selected address, check if the entered address matches an existing one
      if (!addressId) {
        const existingAddressId = findExistingAddress();
        if (existingAddressId) {
          addressId = existingAddressId;
          toast({
            title: "Using existing address",
            description: "We found a matching address in your saved addresses",
          });
        }
      }

      // If still no address ID, create a new one
      if (!addressId) {
        const addressPayload = {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          is_default: false
        };

        const { address } = await createAddress(addressPayload);
        addressId = address.id;
        setAllAddresses(prev => [...prev, address]);
        
        toast({
          title: "New address saved",
          description: "Your new address has been added to your account",
        });
      }

      const orderData: CheckoutData = {
        user_id: user.id,
        shipping_address_id: addressId,
        cart_id: cart_id,
        discount_code: discount?.code, 
        discount_amount: discount?.amount,
        subtotal,
        total,
      };
  
      const response = await createOrder(orderData);
      
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${response.order.id} has been received.`,
      });
      
      router.push(`/order-confirmation?orderId=${response.order.id}`);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      
      let errorMessage = "There was an error processing your order. Please try again.";
      if (error.message.includes("Cart not found")) {
        errorMessage = "Your cart session expired. Please add items to your cart again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
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
                  disabled={isLoading || isCartLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading || isCartLoading}
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
                disabled={isLoading || isCartLoading}
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
                disabled={isLoading || isCartLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Enter the address where you want your order delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && allAddresses.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Addresses</Label>
                <Select 
                  value={selectedAddressId} 
                  onValueChange={handleAddressChange}
                  disabled={isLoading || isCartLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved address" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAddresses.map((address) => (
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
                disabled={isLoading || isCartLoading}
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
                  disabled={isLoading || isCartLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading || isCartLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input 
                  id="zip" 
                  value={formData.zip} 
                  onChange={handleInputChange} 
                  required 
                  disabled={isLoading || isCartLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isCartLoading || !items.length || !formData.address}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order (${items.length} items)`
            )}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}