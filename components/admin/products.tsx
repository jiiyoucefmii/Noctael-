"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Search, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { getProducts, deleteProduct, type Product } from "@/utils/api/products"
import { getCategories, type Category } from "@/utils/api/categories"
import ProductForm from "./product-form"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function Products() {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProductId, setEditProductId] = useState<string | null>(null)
  const [viewVariantsDialogOpen, setViewVariantsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])
        setProductList(productsData || [])
        setCategories(categoriesData.categories || [])
      } catch {
        toast({
          title: "Error",
          description: "Failed to load products or categories.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const filteredProducts = productList.filter((product) => {
    const categoryMatch = selectedCategory === "all" || product.category_id === selectedCategory
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && searchMatch
  })

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      await deleteProduct(productToDelete)
      setProductList((prev) => prev.filter((p) => p.id !== productToDelete))
      toast({ title: "Product deleted", description: "The product has been successfully deleted." })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleEditProduct = (productId: string) => {
    setEditProductId(productId)
    setDialogOpen(true)
  }

  const handleViewVariants = (product: Product) => {
    setSelectedProduct(product)
    setViewVariantsDialogOpen(true)
  }

  const handleProductCreated = (newProduct: Product) => {
    setProductList((prev) => [...prev, newProduct])
    setDialogOpen(false)
  }

  const handleProductUpdated = (updatedProduct: Product) => {
    setProductList((prev) => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
    setDialogOpen(false)
  }

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) setEditProductId(null)
      }}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button className="text-base px-4 py-2" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" /> Add Product
          </Button>
          <ProductForm 
            categories={categories}
            productId={editProductId}
            onProductCreated={handleProductCreated}
            onProductUpdated={handleProductUpdated}
            onClose={() => setDialogOpen(false)}
          />
        </div>
      </Dialog>

      {/* Variants View Dialog */}
      <Dialog open={viewVariantsDialogOpen} onOpenChange={setViewVariantsDialogOpen}>
        <DialogContent className="rounded-[5px] border-0 p-6 bg-[#171717] w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Variants - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {selectedProduct?.variants?.length ? (
              selectedProduct.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="border p-6 rounded-xl text-lg space-y-4 bg-muted shadow-md"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <p><strong>Size:</strong> {variant.size}</p>
                    <p><strong>Color:</strong> {variant.color}</p>
                    <p><strong>Price:</strong> {Number(variant.price).toFixed(0)} Da</p>
                    {variant.sale_price != null && variant.sale_price > 0 && (
                      <p><strong>Sale Price:</strong> {Number(variant.sale_price).toFixed(0)} Da</p>
                    )}
                    <p><strong>Stock:</strong> {variant.stock}</p>
                  </div>

                  {variant.images?.length > 0 && (
                    <div className="flex flex-wrap gap-4 pt-4">
                      {variant.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-28 h-28 md:w-32 md:h-32 border rounded-lg overflow-hidden"
                        >
                          <img
                            src={img.image_url.startsWith("http") ? img.image_url : `${API_URL}${img.image_url}`}
                            alt={`Variant image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-lg font-medium text-muted-foreground">No variants available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category-filter"
              className="w-full p-2 border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                id="product-search"
                type="search"
                placeholder={`Search by name${selectedCategory !== 'all' ? ' in selected category' : ''}...`}
                className="pl-10 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[5px] border-0 p-6 bg-[#171717] flex flex-col overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Guide</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-lg">Loading products...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-lg">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No products match your search criteria" 
                    : "No products found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const imagePath = product.main_image || product.variants?.[0]?.images?.[0]?.image_url
                const imageUrl = imagePath ? (imagePath.startsWith("http") ? imagePath : `${API_URL}${imagePath}`) : "/placeholder.png"
                const firstVariant = product.variants?.[0]
                const price = firstVariant?.sale_price ?? firstVariant?.price ?? 0
                const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0)

                return (
                  <TableRow key={product.id} className="text-base">
                    <TableCell>
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="object-cover w-16 h-16"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{product.name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{price.toFixed(0)} Da</TableCell>
                    <TableCell>{totalStock}</TableCell>
                    <TableCell>
                      {product.guide ? (
                        <a
                          href={product.guide.startsWith("http") ? product.guide : `${API_URL}${product.guide}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                          style={{ textDecoration: "none" }}
                        >
                          Download Guide
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-sm"
                        onClick={() => handleViewVariants(product)}
                      >
                        View Variants
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash className="h-5 w-5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}