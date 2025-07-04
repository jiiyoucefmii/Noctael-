"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { ArrowUpDown } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function ProductSort() {
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

  const setSort = (value: string) => {
    router.push(`/products?${createQueryString("sort", value)}`)
  }

  const currentSort = searchParams.get("sort") || "featured"

  const sortOptions = {
    featured: "Featured",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    newest: "Newest",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          <span>Sort: {sortOptions[currentSort as keyof typeof sortOptions]}</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setSort("featured")}>Featured</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("price-asc")}>Price: Low to High</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("price-desc")}>Price: High to Low</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort("newest")}>Newest</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
