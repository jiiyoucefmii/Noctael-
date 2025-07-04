export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  gender?: "men" | "women" | "unisex"
  sizes?: string[]
  colors?: string[]
  isNew?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  salePrice?: number
  stock: number
}
