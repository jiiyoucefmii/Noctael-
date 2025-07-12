"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  getAllShippingOptions,
  createShippingOption,
  updateShippingOption,
  deleteShippingOption,
  type ShippingOption,
} from "@/utils/api/shippingOptions"

export default function AdminShippingOptions() {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ShippingOption | null>(null)

  const [formData, setFormData] = useState({
    state: "",
    to_home: "",
    to_desk: "",
  })

  const { toast } = useToast()

  const fetchOptions = async () => {
    try {
      const options = await getAllShippingOptions()
      setShippingOptions(options)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const handleOpen = (option?: ShippingOption) => {
    setEditing(option || null)
    setFormData({
      state: option?.state || "",
      to_home: option?.to_home?.toString() || "",
      to_desk: option?.to_desk?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    const payload = {
      state: formData.state,
      to_home: Number(formData.to_home),
      to_desk: Number(formData.to_desk),
    }

    try {
      if (editing) {
        await updateShippingOption(editing.id, payload)
        toast({ title: "Updated", description: "Shipping option updated." })
      } else {
        await createShippingOption(payload)
        toast({ title: "Created", description: "Shipping option added." })
      }
      setIsDialogOpen(false)
      fetchOptions()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteShippingOption(id)
      toast({ title: "Deleted", description: "Shipping option deleted." })
      fetchOptions()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipping Options</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Shipping Option" : "Add Shipping Option"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_home">To Home (DA)</Label>
                <Input
                  id="to_home"
                  type="number"
                  value={formData.to_home}
                  onChange={(e) => setFormData({ ...formData, to_home: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_desk">To Desk (DA)</Label>
                <Input
                  id="to_desk"
                  type="number"
                  value={formData.to_desk}
                  onChange={(e) => setFormData({ ...formData, to_desk: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {shippingOptions.length === 0 ? (
          <p className="text-gray-500">No shipping options added yet.</p>
        ) : (
          shippingOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{option.state}</p>
                <p className="text-sm text-gray-500">
                  🏠 {Number(option.to_home).toFixed(2)} DA &nbsp; | &nbsp; 🧾 {Number(option.to_desk).toFixed(2)} DA
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpen(option)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(option.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
