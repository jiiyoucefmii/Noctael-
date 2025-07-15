"use client"

import { useState, useEffect, useRef } from "react"
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
  createProduct, getProducts, deleteProduct, updateProduct, getProductById, 
  addProductVariant, updateProductVariant, deleteProductVariant,
  type Product, type ProductVariant, type ProductImage,
} from "@/utils/api/products"
import { getCategories, createCategory, type Category } from "@/utils/api/categories"
import { uploadVariantImages, getVariantImages, deleteImage } from "@/utils/api/upload"

// Add at the top, after imports
const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function AdminProducts() {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
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

  const [newVariant, setNewVariant] = useState<{
    id?: string;
    color: string;
    size: string;
    price: number;
    sale_price: number;
    stock: number;
    images: File[];
    existingImages: ProductImage[];
  }>({
    id: "",
    color: "",
    size: "",
    price: 0,
    sale_price: 0,
    stock: 0,
    images: [],
    existingImages: [],
  })

  const [variantList, setVariantList] = useState<typeof newVariant[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryParent, setNewCategoryParent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editProductId, setEditProductId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newColor, setNewColor] = useState("")
  const [isAddingColor, setIsAddingColor] = useState(false)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  const resetForm = () => {
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
    setNewVariant({
      id: "",
      color: "",
      size: "",
      price: 0,
      sale_price: 0,
      stock: 0,
      images: [],
      existingImages: [],
    })
    setVariantList([])
    setIsEditing(false)
    setEditProductId(null)
    setIsAddingVariant(false)
  }

  const handleAddVariant = () => {
    if (editingVariantIndex !== null) {
      // Update existing variant
      const updatedList = [...variantList]
      updatedList[editingVariantIndex] = { ...newVariant }
      setVariantList(updatedList)
      setEditingVariantIndex(null)
    } else {
      // Add new variant
      setVariantList([...variantList, { ...newVariant }])
    }
    setNewVariant({
      id: "",
      color: "",
      size: "",
      price: 0,
      sale_price: 0,
      stock: 0,
      images: [],
      existingImages: [],
    })
    setVariantDialogOpen(false)
  }

  const handleEditVariant = (index: number) => {
    setNewVariant({ ...variantList[index] })
    setEditingVariantIndex(index)
    setVariantDialogOpen(true)
  }

  const handleRemoveVariant = (index: number) => {
    const newList = [...variantList]
    newList.splice(index, 1)
    setVariantList(newList)
  }

  const handleRemoveVariantImage = async (variantIndex: number, imageIndex: number, imageId?: string) => {
    if (imageId) {
      // Delete image from server
      try {
        await deleteImage(imageId)
        const newList = [...variantList]
        newList[variantIndex].existingImages = newList[variantIndex].existingImages.filter(
          (_, idx) => idx !== imageIndex
        )
        setVariantList(newList)
        toast({
          title: "Image deleted",
          description: "Image has been successfully removed."
        })
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          variant: "destructive"
        })
      }
    } else {
      // Remove image from local state (not yet uploaded)
      const newList = [...variantList]
      newList[variantIndex].images.splice(imageIndex, 1)
      setVariantList(newList)
    }
  }

  const handleAddProduct = async () => {
    try {
      const productData: Partial<Product> = {
        ...newProduct,
        variants: variantList.map((v) => ({
          color: v.color,
          size: v.size,
          price: Number(v.price),
          sale_price: Number(v.sale_price),
          stock: Number(v.stock),
          images: [],
        })),
        colors: Array.from(new Set(variantList.map((v) => v.color))),
        sizes: Array.from(new Set(variantList.map((v) => v.size))),
      }

      const created = await createProduct(productData)
      const createdProduct = created.product
      const createdVariants = createdProduct.variants || []

      // Upload images for each variant
      for (let i = 0; i < variantList.length; i++) {
        const localVariant = variantList[i]
        const serverVariant = createdVariants[i]

        if (localVariant.images?.length > 0 && serverVariant?.id) {
          await uploadVariantImages(serverVariant.id, localVariant.images)
        }
      }

      setProductList((prev) => [...prev, createdProduct])
      toast({ title: "Product added", description: "New product has been successfully created." })
      resetForm()
      setDialogOpen(false)

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to create product. Try again later.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProduct = async () => {
    if (!editProductId) return
    
    try {
      // First update the product details
      const productData: Partial<Product> = {
        name: newProduct.name,
        description: newProduct.description,
        category_id: newProduct.category_id,
        gender: newProduct.gender,
        is_new: newProduct.is_new,
        is_featured: newProduct.is_featured,
        is_on_sale: newProduct.is_on_sale,
        colors: Array.from(new Set(variantList.map((v) => v.color))),
        sizes: Array.from(new Set(variantList.map((v) => v.size))),
      }

      const updated = await updateProduct(editProductId, productData)
      const updatedProduct = updated.product

      // Handle variants
      for (const variant of variantList) {
        if (variant.id) {
          // Update existing variant
          await updateProductVariant(variant.id, {
            color: variant.color,
            size: variant.size,
            price: Number(variant.price),
            sale_price: Number(variant.sale_price),
            stock: Number(variant.stock),
          })
        } else {
          // Add new variant
          const newVariantData = await addProductVariant(editProductId, {
            color: variant.color,
            size: variant.size,
            price: Number(variant.price),
            sale_price: Number(variant.sale_price),
            stock: Number(variant.stock),
          })
          variant.id = newVariantData.variant.id
        }

        // Upload new images for this variant
        if (variant.images?.length > 0 && variant.id) {
          await uploadVariantImages(variant.id, variant.images)
        }
      }

      setProductList((prev) => 
        prev.map(p => p.id === editProductId ? updatedProduct : p)
      )
      toast({ title: "Product updated", description: "Product has been successfully updated." })
      resetForm()
      setDialogOpen(false)

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to update product. Try again later.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (productId: string) => {
    try {
      const product = await getProductById(productId)
      
      setNewProduct({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        gender: product.gender,
        is_new: product.is_new,
        is_featured: product.is_featured,
        is_on_sale: product.is_on_sale,
        colors: product.colors,
        sizes: product.sizes,
      })

      // Load variants with their images
      const variantsWithFiles = await Promise.all(
        product.variants.map(async (v) => {
          const imagesResponse = await getVariantImages(v.id!)
          return {
            id: v.id,
            color: v.color,
            size: v.size,
            price: Number(v.price),
            sale_price: Number(v.sale_price) || 0,
            stock: Number(v.stock),
            images: [] as File[],
            existingImages: imagesResponse.images || [],
          }
        })
      )

      setVariantList(variantsWithFiles)
      setIsEditing(true)
      setEditProductId(productId)
      setDialogOpen(true)

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load product for editing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddNewVariant = () => {
    setNewVariant({
      id: "",
      color: "",
      size: "",
      price: 0,
      sale_price: 0,
      stock: 0,
      images: [],
      existingImages: [],
    })
    setEditingVariantIndex(null)
    setIsAddingVariant(true)
    setVariantDialogOpen(true)
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
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="text-base px-4 py-2">
              <Plus className="mr-2 h-5 w-5" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[5px] border-0 p-6 bg-[#171717] max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update product details below." : "Enter product details below."}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 py-4 px-1">
              <Input 
                placeholder="Product Name" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
              />
              <Input 
                placeholder="Description" 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
              />

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
                    checked={newProduct.is_new || false}
                    onChange={(e) => setNewProduct({ ...newProduct, is_new: e.target.checked })}
                  />
                  <span className="text-sm">New</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.is_featured || false}
                    onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.is_on_sale || false}
                    onChange={(e) => setNewProduct({ ...newProduct, is_on_sale: e.target.checked })}
                  />
                  <span className="text-sm">On Sale</span>
                </label>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-3">Variants</h3>
                {variantList.length > 0 ? (
                  <div className="space-y-3">
                    {variantList.map((variant, index) => (
                      <div key={index} className="border p-3 rounded-md bg-gray-50 space-y-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {variant.size} / {variant.color} - ${variant.price} 
                              {variant.sale_price > 0 && ` (Sale: $${variant.sale_price})`} | Stock: {variant.stock}
                            </p>
                            {variant.id && <p className="text-xs text-gray-500">ID: {variant.id}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditVariant(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveVariant(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {(variant.images?.length > 0 || variant.existingImages?.length > 0) && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {variant.existingImages?.map((file, idx) => (
                              <div key={`existing-${idx}`} className="relative w-20 h-20 border rounded-md overflow-hidden group">
                                <img
                                  src={file.image_url.startsWith("http") ? file.image_url : `${API_URL}${file.image_url}`}
                                  alt={`Variant image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveVariantImage(index, idx, file.id)}
                                >
                                  <Trash className="h-5 w-5 text-white" />
                                </button>
                              </div>
                            ))}
                            {variant.images?.map((file, idx) => (
                              <div key={`new-${idx}`} className="relative w-20 h-20 border rounded-md overflow-hidden group">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveVariantImage(index, idx)}
                                >
                                  <Trash className="h-5 w-5 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No variants added yet.</p>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-3"
                  onClick={handleAddNewVariant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditing ? "Add New Variant" : "Add Variant"}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              {isEditing ? (
                <Button onClick={handleUpdateProduct}>Update Product</Button>
              ) : (
                <Button onClick={handleAddProduct}>Save Product</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="rounded-[5px] border-0 p-6 bg-[#171717] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVariantIndex !== null ? "Edit Variant" : "Add New Variant"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-muted-foreground mb-1">Color</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={isAddingColor ? "__add_new__" : newVariant.color}
                  onChange={e => {
                    if (e.target.value === "__add_new__") {
                      setIsAddingColor(true)
                      setNewColor("")
                      setNewVariant(prev => ({ ...prev, color: "" }))
                    } else {
                      setIsAddingColor(false)
                      setNewVariant(prev => ({ ...prev, color: e.target.value }))
                    }
                  }}
                >
                  <option value="">Select Color</option>
                  {Array.isArray(newProduct.colors) && newProduct.colors
                    .filter((color, idx, arr) => color && arr.indexOf(color) === idx)
                    .map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  <option value="__add_new__">Add new color...</option>
                </select>
                {isAddingColor && (
                  <div className="flex mt-2 gap-2">
                    <Input
                      placeholder="New color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newColor && !newProduct.colors?.includes(newColor)) {
                          setNewProduct(prev => ({
                            ...prev,
                            colors: [...(prev.colors || []), newColor]
                          }))
                        }
                        setNewVariant(prev => ({ ...prev, color: newColor }))
                        setIsAddingColor(false)
                        setNewColor("")
                      }}
                      disabled={!newColor}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingColor(false)
                        setNewColor("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
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
                  onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-muted-foreground mb-1">Sale Price</label>
                <Input
                  type="number"
                  value={newVariant.sale_price}
                  onChange={(e) => setNewVariant({ ...newVariant, sale_price: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-1">Stock</label>
                <Input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Images</label>
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

              {(newVariant.images?.length > 0 || newVariant.existingImages?.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {newVariant.existingImages?.map((file, index) => (
                    <div key={`existing-${index}`} className="relative w-20 h-20 border rounded-md overflow-hidden">
                      <img
                        src={file.image_url.startsWith("http") ? file.image_url : `${API_URL}${file.image_url}`}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {newVariant.images?.map((file, index) => (
                    <div key={`new-${index}`} className="relative w-20 h-20 border rounded-md overflow-hidden group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = [...newVariant.images]
                          newImages.splice(index, 1)
                          setNewVariant(prev => ({ ...prev, images: newImages }))
                        }}
                      >
                        <Trash className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddVariant}>
              {editingVariantIndex !== null ? "Update Variant" : "Add Variant"}
            </Button>
          </DialogFooter>
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
                <TableCell colSpan={7} className="h-24 text-center text-lg">
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
                              product.variants.map((variant) => (
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