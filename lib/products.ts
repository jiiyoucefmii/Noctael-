import type { Product } from "@/types/product"

// Mock product data
const products: Product[] = [
  {
    id: "1",
    name: "Shadow Oversized Tee",
    description: "A premium oversized t-shirt with a minimalist design.",
    price: 49.99,
    images: ["/images/product-1.jpg", "/images/product-1-2.jpg"],
    category: "T-Shirts",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Gray"],
    isNew: true,
    isFeatured: true,
    stock: 100,
  },
  {
    id: "2",
    name: "Midnight Hoodie",
    description: "A comfortable hoodie perfect for those cold nights.",
    price: 79.99,
    images: ["/images/product-2.jpg", "/images/product-2-2.jpg"],
    category: "Hoodies",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray"],
    isFeatured: true,
    stock: 75,
  },
  {
    id: "3",
    name: "Eclipse Cargo Pants",
    description: "Stylish cargo pants with multiple pockets for functionality.",
    price: 89.99,
    images: ["/images/product-3.jpg", "/images/product-3-2.jpg"],
    category: "Pants",
    gender: "men",
    sizes: ["30", "32", "34", "36"],
    colors: ["Black", "Olive"],
    isFeatured: true,
    stock: 50,
  },
  {
    id: "4",
    name: "Lunar Beanie",
    description: "Keep warm with our stylish beanie.",
    price: 29.99,
    images: ["/images/product-4.jpg"],
    category: "Accessories",
    gender: "unisex",
    sizes: ["One Size"],
    colors: ["Black", "Gray", "Navy"],
    isFeatured: true,
    stock: 120,
  },
  {
    id: "5",
    name: "Void Bomber Jacket",
    description: "A sleek bomber jacket for a stylish look.",
    price: 129.99,
    images: ["/images/product-5.jpg", "/images/product-5-2.jpg"],
    category: "Jackets",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    isNew: true,
    stock: 40,
  },
  {
    id: "6",
    name: "Dusk Crop Top",
    description: "A comfortable crop top for casual wear.",
    price: 39.99,
    images: ["/images/product-6.jpg"],
    category: "Tops",
    gender: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "White", "Gray"],
    isOnSale: true,
    salePrice: 29.99,
    stock: 60,
  },
  {
    id: "7",
    name: "Phantom Sweatpants",
    description: "Comfortable sweatpants for lounging or working out.",
    price: 59.99,
    images: ["/images/product-7.jpg"],
    category: "Pants",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray"],
    stock: 85,
  },
  {
    id: "8",
    name: "Obsidian Cap",
    description: "A stylish cap to complete your outfit.",
    price: 34.99,
    images: ["/images/product-8.jpg"],
    category: "Accessories",
    gender: "unisex",
    sizes: ["One Size"],
    colors: ["Black", "White"],
    isOnSale: true,
    salePrice: 24.99,
    stock: 100,
  },
]

interface GetProductsOptions {
  category?: string
  gender?: "men" | "women" | "unisex"
  featured?: boolean
  new?: boolean
  sale?: boolean
  limit?: number
}

export async function getProducts(options: GetProductsOptions = {}) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredProducts = [...products]

  if (options.category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === options.category?.toLowerCase(),
    )
  }

  if (options.gender) {
    filteredProducts = filteredProducts.filter(
      (product) => product.gender === options.gender || product.gender === "unisex",
    )
  }

  if (options.featured) {
    filteredProducts = filteredProducts.filter((product) => product.isFeatured)
  }

  if (options.new) {
    filteredProducts = filteredProducts.filter((product) => product.isNew)
  }

  if (options.sale) {
    filteredProducts = filteredProducts.filter((product) => product.isOnSale)
  }

  if (options.limit) {
    filteredProducts = filteredProducts.slice(0, options.limit)
  }

  return filteredProducts
}

export async function getProductById(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return products.find((product) => product.id === id)
}
