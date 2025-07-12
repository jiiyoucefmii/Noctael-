"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, updateUserProfile } from "@/utils/api/users"
import {
  getUserAddresses,
  createAddress,
  Address,
} from "@/utils/api/addresses"
import { createOrder } from "@/utils/api/orders"
import { useCart } from "@/hooks/use-cart"
import { getAllShippingOptions } from "@/utils/api/shippingOptions"

export default function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [availableStates, setAvailableStates] = useState<string[]>([])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Algeria",
  })

  const router = useRouter()
  const { toast } = useToast()
  const {
    items,
    cart_id,
    discount,
    subtotal,
    total,
    shipping,
    setShippingState,
    setShippingType,
    shippingType,
    clearCart,
    isLoading: isCartLoading,
  } = useCart()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const shippingOptions = await getAllShippingOptions()
      const states = [...new Set(shippingOptions.map(opt => opt.state))]
      setAvailableStates(states)

      const userData = await getCurrentUser()
      if (!userData) {
        toast({ title: "Login required", description: "Please sign in", variant: "destructive" })
        router.push("/login")
        return
      }
      setUser(userData)
      setUserInfo(userData)
      setFormData((prev) => ({
        ...prev,
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone_number || "",
      }))

      const res = await getUserAddresses()
      setAddresses(res.addresses || [])

      const defaultAddr = res.addresses.find((a) => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        setFormData((prev) => ({
          ...prev,
          address: defaultAddr.address || "",
          city: defaultAddr.city || "",
          state: defaultAddr.state || "",
          zip: defaultAddr.zip || "",
        }))
        
        if (states.includes(defaultAddr.state)) {
          await setShippingState(defaultAddr.state)
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast, router, setShippingState])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleStateChange = useCallback(async (value: string) => {
    setFormData(prev => ({ ...prev, state: value }))
    await setShippingState(value)
  }, [setShippingState])

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id)
    const found = addresses.find((a) => a.id === id)
    if (found) {
      setFormData((prev) => ({
        ...prev,
        address: found.address,
        city: found.city,
        state: found.state,
        zip: found.zip,
      }))
      
      if (availableStates.includes(found.state)) {
        setShippingState(found.state)
      }
    }
  }

  const findExistingAddress = (): string | null => {
    const { address, city, state, zip } = formData
    const match = addresses.find(
      (a) => a.address === address && a.city === city && a.state === state && a.zip === zip
    )
    return match ? match.id : null
  }

  const handleInformationUpdate = async () => {
    try {
      const updatedInfo = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone,
      }

      const updatedUser = await updateUserProfile(updatedInfo)
      setUser(updatedUser)
      setUserInfo(updatedUser)
      return true
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update personal information",
        variant: "destructive",
      })
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !cart_id || !items.length) {
      toast({ title: "Invalid state", description: "Missing user or cart", variant: "destructive" })
      return
    }

    if (!formData.address || !formData.state) {
      toast({ title: "Missing address", description: "Enter a valid shipping address", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      let addressId = selectedAddressId || findExistingAddress()
      if (!addressId) {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          is_default: false,
        }
        const { address } = await createAddress(payload)
        addressId = address.id
        setAddresses((prev) => [...prev, address])
      }

      const hasChanges = [
        formData.firstName !== userInfo.first_name,
        formData.lastName !== userInfo.last_name,
        formData.email !== userInfo.email,
        formData.phone !== userInfo.phone_number,
      ].some(Boolean)

      if (hasChanges) {
        const updateSuccess = await handleInformationUpdate()
        if (!updateSuccess) {
          return
        }
        toast({ title: "Info updated", description: "Your personal information has been updated." })
      }

      const orderData = {
        user_id: user.id,
        shipping_address_id: addressId,
        cart_id,
        discount_code: discount?.code,
        discount_amount: discount?.amount,
        subtotal,
        shipping_cost: shipping,
        total,
      }
      const { order } = await createOrder(orderData)
      toast({ title: "Order placed", description: `Order #${order.id} was created.` })
      router.push(`/order-confirmation?orderId=${order.id}`)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create order", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Contact Info</CardTitle>
          <CardDescription>
            Update your personal information if needed
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={formData.phone} onChange={handleInputChange} required disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Address</Label>
              <Select value={selectedAddressId} onValueChange={handleAddressChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id || ""}>
                      {addr.name} - {addr.address}, {addr.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" value={formData.zip} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={formData.country} disabled />
            </div>
            <div className="space-y-2">
              <Label>Shipping Type</Label>
              <Select value={shippingType} onValueChange={(value: 'to_home' | 'to_desk') => setShippingType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_home">To Home</SelectItem>
                  <SelectItem value="to_desk">To Desk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isCartLoading || !items.length || !formData.address || !formData.state}
        >
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</> : `Place Order (${items.length} items)`}
        </Button>
      </CardFooter>
    </form>
  )
}