"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getCategories, type Category } from "@/utils/api/categories"

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get current filters from URL
  const currentCategory = searchParams?.get("category")
  const currentGender = searchParams?.get("gender")
  const isNew = searchParams?.get("new") === "true"
  const isOnSale = searchParams?.get("sale") === "true"

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        // Handle both possible API response structures
        setCategories(Array.isArray(data) ? data : (data.categories || []))
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Helper to update filters
  const updateFilters = (
    key: string, 
    value: string | boolean | null
  ) => {
    // Create a new URLSearchParams object from current params
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    // Handle parameter updates
    if (value === null) {
      params.delete(key)
    } else if (typeof value === "boolean") {
      params.set(key, value.toString())
    } else {
      params.set(key, value)
    }
    
    // Preserve current sort parameter if it exists
    const currentSort = searchParams?.get("sort")
    if (currentSort) {
      params.set("sort", currentSort)
    }
    
    // Navigate to the updated URL with the filters
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox 
                  id={`category-${category.id}`} 
                  checked={currentCategory === category.id}
                  onCheckedChange={(checked) => 
                    updateFilters("category", checked ? category.id : null)
                  }
                />
                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No categories available</p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Gender</h3>
        <div className="space-y-2">
          {["men", "women", "unisex"].map((gender) => (
            <div key={gender} className="flex items-center gap-2">
              <Checkbox 
                id={`gender-${gender}`} 
                checked={currentGender === gender}
                onCheckedChange={(checked) => 
                  updateFilters("gender", checked ? gender : null)
                }
              />
              <Label htmlFor={`gender-${gender}`}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Product Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="new-products" 
              checked={isNew}
              onCheckedChange={(checked) => 
                updateFilters("new", checked ? true : null)
              }
            />
            <Label htmlFor="new-products">New Arrivals</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="sale-products" 
              checked={isOnSale}
              onCheckedChange={(checked) => 
                updateFilters("sale", checked ? true : null)
              }
            />
            <Label htmlFor="sale-products">On Sale</Label>
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => router.push("/products")}
      >
        Clear All Filters
      </Button>
    </div>
  )
}
