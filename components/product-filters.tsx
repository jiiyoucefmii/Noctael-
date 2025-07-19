// components/product-filters.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getCategories } from "@/utils/api/categories"
import { Category } from "@/utils/api/categories"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

  const currentCategories = searchParams?.getAll('category') || []
  const currentGenders = searchParams?.getAll('gender') || []
  const currentSort = searchParams?.get('sort') || 'relevancy'
  const isNew = searchParams?.has('new')
  const isOnSale = searchParams?.has('sale')

  const updateParams = (newParams: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams?.toString())
    
    // Always reset to first page when filters change
    params.delete('page')
    
    Object.entries(newParams).forEach(([key, value]) => {
      params.delete(key)
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })
    
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const toggleFilter = (name: string, value: string) => {
    const currentValues = searchParams?.getAll(name) || []
    
    if (currentValues.includes(value)) {
      updateParams({
        [name]: currentValues.filter(v => v !== value)
      })
    } else {
      updateParams({
        [name]: [...currentValues, value]
      })
    }
  }

  const toggleSpecialFilter = (name: string) => {
    if (searchParams?.has(name)) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(name)
      params.delete('page')
      router.push(`/products?${params.toString()}`, { scroll: false })
    } else {
      const params = new URLSearchParams(searchParams?.toString())
      params.set(name, 'true')
      params.delete('page')
      router.push(`/products?${params.toString()}`, { scroll: false })
    }
  }

  const handleSortChange = (value: string) => {
    updateParams({
      sort: value === 'relevancy' ? '' : value
    })
  }

  const clearFilters = () => {
    router.push("/products", { scroll: false })
  }

  if (loading) {
    return <div className="space-y-6 text-muted-foreground">Loading filters...</div>
  }

  if (error) {
    return <div className="space-y-6 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">FILTER & SORT</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["sort"]} className="space-y-4">
        <AccordionItem value="sort" className="border-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <h3 className="font-medium text-foreground">SORT BY</h3>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={currentSort} onValueChange={handleSortChange} className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="price-asc" id="price-low" />
                <Label htmlFor="price-low" className="text-sm font-normal cursor-pointer">Price: Low to High</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="price-desc" id="price-high" />
                <Label htmlFor="price-high" className="text-sm font-normal cursor-pointer">Price: High to Low</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="relevancy" id="relevancy" />
                <Label htmlFor="relevancy" className="text-sm font-normal cursor-pointer">Relevancy</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="newest" id="newest" />
                <Label htmlFor="newest" className="text-sm font-normal cursor-pointer">Newest</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <hr className="border-border" />

        <AccordionItem value="categories" className="border-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <h3 className="font-medium text-foreground">PRODUCT TYPE</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={currentCategories.includes(category.id)}
                    onCheckedChange={() => toggleFilter("category", category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <hr className="border-border" />

        <AccordionItem value="gender" className="border-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <h3 className="font-medium text-foreground">GENDER</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {genders.map((gender) => (
                <div key={gender.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`gender-${gender.id}`}
                    checked={currentGenders.includes(gender.id)}
                    onCheckedChange={() => toggleFilter("gender", gender.id)}
                  />
                  <Label htmlFor={`gender-${gender.id}`} className="text-sm font-normal cursor-pointer">
                    {gender.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}