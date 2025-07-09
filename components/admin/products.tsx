"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Search, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

import {
  createProduct, getProducts, deleteProduct, type Product,
} from "@/utils/api/products"
import { getCategories, createCategory, type Category } from "@/utils/api/categories"
import { uploadVariantImages } from "@/utils/api/upload"

export default function AdminProducts() {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    category_id: "",
    gender: "unisex",
    is_new: false,
    is_featured: false,
    is_on_sale: false,
    variants: [],
    colors: [],
    sizes: [],
  })

  const [newVariant, setNewVariant] = useState({
    color: "",
    size: "",
    price: 0,
    sale_price: 0,
    stock: 0,
    images: [] as File[],
  })

  const [variantList, setVariantList] = useState<typeof newVariant[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryParent, setNewCategoryParent] = useState("")

  const handleAddVariant = () => {
    setVariantList([...variantList, { ...newVariant }])
    setNewVariant({ color: "", size: "", price: 0, sale_price: 0, stock: 0, images: [] })
  }

  const handleAddProduct = async () => {
    try {
      const productData: Partial<Product> = {
        ...newProduct,
        variants: variantList.map((v) => ({ ...v, images: [] })),
        colors: variantList.map((v) => v.color),
        sizes: variantList.map((v) => v.size),
      }

      const created = await createProduct(productData)
      const createdProduct = created.product
      const createdVariants = createdProduct.variants || []

      for (let i = 0; i < variantList.length; i++) {
        const localVariant = variantList[i]
        const serverVariant = createdVariants[i]

        if (localVariant.images?.length > 0 && serverVariant) {
          await uploadVariantImages(serverVariant.id, localVariant.images)
        }
      }

      setProductList((prev) => [...prev, createdProduct])
      toast({ title: "Product added", description: "New product has been successfully created." })

      setNewProduct({
        name: "",
        description: "",
        category_id: "",
        gender: "unisex",
        is_new: false,
        is_featured: false,
        is_on_sale: false,
        variants: [],
        colors: [],
        sizes: [],
      })
      setNewVariant({ color: "", size: "", price: 0, sale_price: 0, stock: 0, images: [] })
      setVariantList([])

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to create product. Try again later.",
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = async () => {
    try {
      const categoryData = {
        name: newCategoryName,
        parent_id: newCategoryParent || undefined
      }

      const response = await createCategory(categoryData)
      const createdCategory = response.category

      const categoriesData = await getCategories()
      setCategories(categoriesData.categories || [])
      
      setNewProduct(prev => ({
        ...prev,
        category_id: createdCategory.id
      }))

      setNewCategoryName("")
      setNewCategoryParent("")
      setShowAddCategory(false)

      toast({
        title: "Category added",
        description: `Category "${createdCategory.name}" has been created successfully.`
      })

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      })
    }
  }

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

  const filteredProducts = productList.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div>
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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-base px-4 py-2">
              <Plus className="mr-2 h-5 w-5" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter product details below.</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 space-y-4 py-4 px-1">
              <Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              <Input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {showAddCategory ? "Cancel" : "New"}
                  </Button>
                </div>

                {showAddCategory && (
                  <div className="p-4 border rounded-md space-y-3">
                    <h4 className="font-medium">Create New Category</h4>
                    <Input 
                      placeholder="Category Name" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newCategoryParent}
                      onChange={(e) => setNewCategoryParent(e.target.value)}
                    >
                      <option value="">No parent category (root)</option>
                      {categories.filter(c => !c.parent_id).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowAddCategory(false)
                          setNewCategoryName("")
                          setNewCategoryParent("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName}
                      >
                        Create Category
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <select
                className="w-full p-2 border rounded-md"
                value={newProduct.gender}
                onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value as "men" | "women" | "unisex" })}
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.is_new}
                    onChange={(e) => setNewProduct({ ...newProduct, is_new: e.target.checked })}
                  />
                  <span className="text-sm">New</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.is_featured}
                    onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.is_on_sale}
                    onChange={(e) => setNewProduct({ ...newProduct, is_on_sale: e.target.checked })}
                  />
                  <span className="text-sm">On Sale</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Color</label>
                  <Input
                    placeholder="Color"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Size</label>
                  <Input
                    placeholder="Size"
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Price</label>
                  <Input
                    type="number"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: +e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Sale Price</label>
                  <Input
                    type="number"
                    value={newVariant.sale_price}
                    onChange={(e) => setNewVariant({ ...newVariant, sale_price: +e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-muted-foreground mb-1">Stock</label>
                  <Input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: +e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Upload Images for This Variant</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-gray-500 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        setNewVariant((prev) => ({
                          ...prev,
                          images: [...prev.images, ...newFiles],
                        }));
                      }}
                    />
                    <p className="text-sm text-gray-600">Click or drag files here</p>
                    <p className="text-xs text-gray-400">Only images supported</p>
                  </div>

                  {newVariant.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {newVariant.images.map((file, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 border rounded-md overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="button" onClick={handleAddVariant} className="col-span-2">
                  Add Variant
                </Button>
              </div>

              {variantList.length > 0 && (
                <div className="space-y-3">
                  {variantList.map((v, i) => (
                    <div key={i} className="border p-3 rounded-md bg-gray-50 space-y-2">
                      <div className="text-sm font-medium">
                        {v.size} / {v.color} - ${v.price} {v.sale_price > 0 && `(Sale: $${v.sale_price})`} | Stock: {v.stock}
                      </div>
                      {v.images?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {v.images.map((file, idx) => (
                            <div key={idx} className="w-20 h-20 border rounded-md overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button onClick={handleAddProduct}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
        <Input
          type="search"
          placeholder="Search by name or category..."
          className="pl-10 py-3 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-lg">Loading products...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-lg">No products found.</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

                const imagePath = product.variants?.[0]?.images?.[0]?.image_url
                const imageUrl = imagePath ? `${BASE_URL}${imagePath}` : "/placeholder.png"
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
                    <TableCell>${price.toFixed(2)}</TableCell>
                    <TableCell>{totalStock}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-sm">View</Button>
                        </DialogTrigger>
                        <DialogContent className="w-full" style={{ maxWidth: "50vw" }}>
                          <DialogHeader>
                            <DialogTitle className="text-xl">Variants - {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.variants?.length > 0 ? (
                              product.variants.map((variant) => {
                                const variantImages = variant.images || []
                                const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

                                return (
                                  <div
                                    key={variant.id}
                                    className="border p-6 rounded-xl text-lg space-y-4 bg-muted shadow-md"
                                  >
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                      <p><strong>Size:</strong> {variant.size}</p>
                                      <p><strong>Color:</strong> {variant.color}</p>
                                      <p><strong>Price:</strong> ${variant.price.toFixed(2)}</p>
                                      {variant.sale_price != null && variant.sale_price > 0 && (
                                        <p><strong>Sale Price:</strong> ${variant.sale_price.toFixed(2)}</p>
                                      )}
                                      <p><strong>Stock:</strong> {variant.stock}</p>
                                    </div>

                                    {variantImages.length > 0 && (
                                      <div className="flex flex-wrap gap-4 pt-4">
                                        {variantImages.map((img, idx) => (
                                          <div
                                            key={idx}
                                            className="w-28 h-28 md:w-32 md:h-32 border rounded-lg overflow-hidden"
                                          >
                                            <img
                                              src={`${BASE_URL}${img.image_url}`}
                                              alt={`Variant image ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-lg font-medium text-muted-foreground">No variants available.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
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