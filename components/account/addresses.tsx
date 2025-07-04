"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock addresses data
const addresses = [
  {
    id: 1,
    name: "Home",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    isDefault: true,
  },
  {
    id: 2,
    name: "Work",
    address: "456 Office Avenue",
    city: "New York",
    state: "NY",
    zip: "10002",
    country: "United States",
    isDefault: false,
  },
]

export default function AccountAddresses() {
  const [userAddresses, setUserAddresses] = useState(addresses)
  const { toast } = useToast()

  const handleDelete = (id: number) => {
    setUserAddresses(userAddresses.filter((address) => address.id !== id))
    toast({
      title: "Address deleted",
      description: "The address has been deleted successfully.",
    })
  }

  const handleSetDefault = (id: number) => {
    setUserAddresses(
      userAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    )
    toast({
      title: "Default address updated",
      description: "Your default address has been updated.",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Manage your shipping addresses</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>Add a new shipping address to your account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name</Label>
                <Input id="name" placeholder="Home, Work, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" />
                </div>
              </div>

            </div>
            <DialogFooter>
              <Button type="submit">Save Address</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {userAddresses.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium">No addresses saved</p>
            <p className="mb-4 text-sm text-gray-500">You haven't added any addresses yet.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </DialogTrigger>
              {/* Dialog content would be duplicated here */}
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {userAddresses.map((address) => (
              <div key={address.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="font-medium">{address.name}</p>
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Default</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country}</p>
                </div>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleSetDefault(address.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
