"use client"

import { useEffect, useState } from "react"
import { PlusCircle, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  getAllDiscountCodes, 
  createDiscountCode, 
  deleteDiscountCode, 
  updateDiscountCode 
} from "@/utils/api/promos"

interface DiscountCode {
  id: string
  code: string
  discount_percent: number
  valid_from?: string | null
  valid_to?: string | null
  usage_limit?: number | null
  usage_count: number
}

export default function AdminPromotions() {
  const [promoCodes, setPromoCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newPromo, setNewPromo] = useState({
    code: "",
    discount_percent: 0,
    valid_from: "",
    valid_to: "",
    usage_limit: ""
  })

  const [editingPromo, setEditingPromo] = useState<DiscountCode | null>(null)

  const fetchPromos = async () => {
    try {
      setLoading(true)
      setError(null)
      const { discountCodes } = await getAllDiscountCodes()
      setPromoCodes(discountCodes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discount codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  const handleCreate = async () => {
    try {
      setError(null)
      await createDiscountCode({
        code: newPromo.code,
        discount_percent: newPromo.discount_percent,
        valid_from: newPromo.valid_from || null,
        valid_to: newPromo.valid_to || null,
        usage_limit: newPromo.usage_limit ? parseInt(newPromo.usage_limit) : null
      })
      setNewPromo({
        code: "",
        discount_percent: 0,
        valid_from: "",
        valid_to: "",
        usage_limit: ""
      })
      await fetchPromos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discount code')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null)
      await deleteDiscountCode(id)
      await fetchPromos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discount code')
    }
  }

  const handleEdit = async () => {
    if (!editingPromo) return
    
    try {
      setError(null)
      await updateDiscountCode(editingPromo.id, {
        discount_percent: editingPromo.discount_percent,
        valid_from: editingPromo.valid_from || null,
        valid_to: editingPromo.valid_to || null,
        usage_limit: editingPromo.usage_limit || null
      })
      setEditingPromo(null)
      await fetchPromos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update discount code')
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> New Promo Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="Code" 
                value={newPromo.code} 
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })} 
              />
              <Input 
                type="number" 
                placeholder="Discount %" 
                min="1"
                max="100"
                value={newPromo.discount_percent} 
                onChange={(e) => setNewPromo({ ...newPromo, discount_percent: parseInt(e.target.value) || 0 })} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <Input 
                    type="date" 
                    value={newPromo.valid_from} 
                    onChange={(e) => setNewPromo({ ...newPromo, valid_from: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid To</label>
                  <Input 
                    type="date" 
                    value={newPromo.valid_to} 
                    onChange={(e) => setNewPromo({ ...newPromo, valid_to: e.target.value })} 
                  />
                </div>
              </div>
              <Input 
                type="number" 
                placeholder="Usage Limit (leave empty for unlimited)" 
                min="1"
                value={newPromo.usage_limit} 
                onChange={(e) => setNewPromo({ ...newPromo, usage_limit: e.target.value })} 
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && !loading && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {promoCodes.length === 0 ? (
            <p className="text-gray-500">No promo codes found.</p>
          ) : (
            promoCodes.map((promo) => (
              <div key={promo.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {promo.code} - {promo.discount_percent}% off
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(promo.valid_from)} to {formatDate(promo.valid_to)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Used {promo.usage_count} time{promo.usage_count !== 1 ? 's' : ''}
                    {promo.usage_limit ? ` of ${promo.usage_limit}` : ' (unlimited)'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => setEditingPromo(promo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    onClick={() => handleDelete(promo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editingPromo && (
        <Dialog open={!!editingPromo} onOpenChange={() => setEditingPromo(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Promo Code</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input 
                value={editingPromo.code} 
                disabled
                className="bg-gray-100"
              />
              <Input 
                type="number" 
                min="1"
                max="100"
                value={editingPromo.discount_percent} 
                onChange={(e) => setEditingPromo({ 
                  ...editingPromo, 
                  discount_percent: parseInt(e.target.value) || 0 
                })} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <Input 
                    type="date" 
                    value={editingPromo.valid_from || ''} 
                    onChange={(e) => setEditingPromo({ 
                      ...editingPromo, 
                      valid_from: e.target.value 
                    })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid To</label>
                  <Input 
                    type="date" 
                    value={editingPromo.valid_to || ''} 
                    onChange={(e) => setEditingPromo({ 
                      ...editingPromo, 
                      valid_to: e.target.value 
                    })} 
                  />
                </div>
              </div>
              <Input 
                type="number" 
                placeholder="Usage Limit (leave empty for unlimited)" 
                min="1"
                value={editingPromo.usage_limit || ''} 
                onChange={(e) => setEditingPromo({ 
                  ...editingPromo, 
                  usage_limit: e.target.value ? parseInt(e.target.value) : null 
                })} 
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}