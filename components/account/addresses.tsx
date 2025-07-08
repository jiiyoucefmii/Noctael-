"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getUserAddresses,
  deleteAddress,
  setDefaultAddress,
  createAddress,
  updateAddress,
  type Address,
} from "@/utils/api/addresses";

export default function AccountAddresses() {
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Address, 'user_id' | 'created_at' | 'updated_at'>>({
    id: undefined,
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getUserAddresses();
        setUserAddresses(response.addresses || []);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
  };

  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        const { address } = await updateAddress(formData.id, formData);
        setUserAddresses((prev) =>
          prev.map((a) => (a.id === address.id ? address : a))
        );
        toast({ title: "Address updated", description: "Address changes saved." });
      } else {
        const { address } = await createAddress(formData);
        setUserAddresses((prev) => [...prev, address]);
        toast({ title: "Address added", description: "Your new address has been saved." });
      }
      handleDialogClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setUserAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Address deleted", description: "The address has been deleted successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      setUserAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          is_default: address.id === id,
        }))
      );
      toast({ title: "Default address updated", description: "Your default address has been updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Manage your shipping addresses</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {formData.id ? "Update your address details." : "Add a new shipping address to your account."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {["name", "address", "city", "state", "zip", "country"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  <Input id={field} value={(formData as any)[field]} onChange={handleInputChange} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSubmit}>
                {formData.id ? "Update" : "Save"} Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : userAddresses.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium">No addresses saved</p>
            <p className="mb-4 text-sm text-gray-500">You haven't added any addresses yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userAddresses.map((address) => (
              <div key={address.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="font-medium">{address.name}</p>
                    {address.is_default && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Default</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id!)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} {address.zip}</p>
                  <p>{address.country}</p>
                </div>
                {!address.is_default && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleSetDefault(address.id!)}>
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
