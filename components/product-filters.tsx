"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const categories = [
  { id: "t-shirts", name: "T-Shirts" },
  { id: "hoodies", name: "Hoodies" },
  { id: "pants", name: "Pants" },
  { id: "jackets", name: "Jackets" },
  { id: "accessories", name: "Accessories" },
]

const genders = [
  { id: "men", name: "Men" },
  { id: "women", name: "Women" },
  { id: "unisex", name: "Unisex" },
]

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }

      return params.toString()
    },
    [searchParams],
  )

  const toggleFilter = (name: string, value: string) => {
    const current = searchParams.get(name)
    const newValue = current === value ? "" : value
    router.push(`/products?${createQueryString(name, newValue)}`)
  }

  const clearFilters = () => {
    router.push("/products")
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
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={searchParams.get("category") === category.id}
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
                    checked={searchParams.get("gender") === gender.id}
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
                  checked={searchParams.get("new") === "true"}
                  onCheckedChange={() => toggleFilter("new", "true")}
                />
                <Label htmlFor="new" className="text-sm font-normal">
                  New Arrivals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sale"
                  checked={searchParams.get("sale") === "true"}
                  onCheckedChange={() => toggleFilter("sale", "true")}
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
