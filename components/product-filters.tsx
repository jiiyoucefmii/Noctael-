"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { getCategories } from "@/utils/api/categories" // Import the API function
import { Category } from "@/utils/api/categories" // Import the Category type

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const genders = [
  { id: "men", name: "Men" },
  { id: "women", name: "Women" },
  { id: "unisex", name: "Unisex" },
]

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Get current filters as arrays
  const currentCategories = searchParams?.getAll('category') || []
  const currentGenders = searchParams?.getAll('gender') || []
  const isNew = searchParams?.has('new')
  const isOnSale = searchParams?.has('sale')

  const toggleFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    const currentValues = params.getAll(name)
    
    if (currentValues.includes(value)) {
      // Remove the value if already present
      const newValues = currentValues.filter(v => v !== value)
      params.delete(name)
      newValues.forEach(v => params.append(name, v))
    } else {
      // Add the value if not present
      params.append(name, value)
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const toggleSpecialFilter = (name: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    
    if (params.has(name)) {
      params.delete(name)
    } else {
      params.set(name, 'true')
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push("/products", { scroll: false })
  }

  if (loading) {
    return <div className="space-y-6">Loading categories...</div>
  }

  if (error) {
    return <div className="space-y-6 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={["category", "gender", "special"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentCategories.includes(category.id)}
                    onCheckedChange={() => toggleFilter("category", category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="gender">
          <AccordionTrigger>Gender</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {genders.map((gender) => (
                <div key={gender.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender.id}`}
                    checked={currentGenders.includes(gender.id)}
                    onCheckedChange={() => toggleFilter("gender", gender.id)}
                  />
                  <Label htmlFor={`gender-${gender.id}`} className="text-sm font-normal">
                    {gender.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="special">
          <AccordionTrigger>Special</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new"
                  checked={isNew}
                  onCheckedChange={() => toggleSpecialFilter("new")}
                />
                <Label htmlFor="new" className="text-sm font-normal">
                  New Arrivals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sale"
                  checked={isOnSale}
                  onCheckedChange={() => toggleSpecialFilter("sale")}
                />
                <Label htmlFor="sale" className="text-sm font-normal">
                  On Sale
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}