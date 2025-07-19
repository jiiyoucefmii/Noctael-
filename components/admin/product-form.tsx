"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
  DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

import {
  createProduct, updateProduct, getProductById, 
  addProductVariant, updateProductVariant,
  type Product, type ProductVariant, type ProductImage,
} from "@/utils/api/products"
import { createCategory, type Category } from "@/utils/api/categories"
import { uploadVariantImages, getVariantImages, deleteImage, uploadProductGuide } from "@/utils/api/upload"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
const MAX_GUIDE_SIZE_MB = 12;
const MAX_GUIDE_SIZE_BYTES = MAX_GUIDE_SIZE_MB * 1024 * 1024;

interface ProductFormProps {
  categories: Category[]
  productId?: string | null
  onProductCreated: (product: Product) => void
  onProductUpdated: (product: Product) => void
  onClose: () => void
}

export default function ProductForm({ 
  categories, 
  productId, 
  onProductCreated, 
  onProductUpdated,
  onClose
}: ProductFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryParent, setNewCategoryParent] = useState("")
  const [newColor, setNewColor] = useState("")
  const [isAddingColor, setIsAddingColor] = useState(false)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const [guideFile, setGuideFile] = useState<File | null>(null)
  const [guideUploading, setGuideUploading] = useState(false)
  const [guideUrl, setGuideUrl] = useState<string | null>(null)

  useEffect(() => {
    if (productId) {
      loadProductForEditing(productId)
      setIsEditing(true)
    } else {
      resetForm()
      setIsEditing(false)
    }
  }, [productId])

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
  }

  const loadProductForEditing = async (id: string) => {
    try {
      setLoading(true)
      const product = await getProductById(id)
      
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
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load product for editing. Please try again.",
        variant: "destructive",
      })
      onClose()
    } finally {
      setLoading(false)
    }
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

  const handleAddCategory = async () => {
    try {
      const categoryData = {
        name: newCategoryName,
        parent_id: newCategoryParent || undefined
      }

      const response = await createCategory(categoryData)
      const createdCategory = response.category
      
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

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      if (isEditing && productId) {
        await handleUpdateProduct()
      } else {
        await handleAddProduct()
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
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

    // Upload guide if selected
    if (guideFile) {
      await handleGuideUpload(createdProduct.id)
    }

    onProductCreated(createdProduct)
    toast({ title: "Product added", description: "New product has been successfully created." })
    resetForm()
    setGuideFile(null)
    setGuideUrl(null)
  }

  const handleUpdateProduct = async () => {
    if (!productId) return
    
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
      guide: newProduct.guide || null, // Include the guide URL
    }
    const updated = await updateProduct(productId, productData)
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
        const newVariantData = await addProductVariant(productId, {
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

    onProductUpdated(updatedProduct)
    toast({ title: "Product updated", description: "Product has been successfully updated." })
  }

  const handleGuideUpload = async (prodId: string) => {
    if (!prodId || !guideFile) return
    setGuideUploading(true)
    try {
      const res = await uploadProductGuide(prodId, guideFile)
      const newGuideUrl = res.guide_url.startsWith("http") ? res.guide_url : `${API_URL}${res.guide_url}`
      
      // Update the product state with the new guide URL
      setNewProduct(prev => ({
        ...prev,
        guide: newGuideUrl
      }))
      
      setGuideUrl(newGuideUrl)
      toast({
        title: "Guide uploaded",
        description: "Product guide PDF uploaded successfully."
      })
      setGuideFile(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload guide. Please try again.",
        variant: "destructive"
      })
    } finally {
      setGuideUploading(false)
    }
  }

  return (
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


        {/* PDF Guide Upload Section (always visible) */}
        <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Product Guide (PDF)
  </label>

  <div className="flex items-center gap-3">
    <input
      type="file"
      accept="application/pdf"
      className="block w-full text-sm text-gray-900 file:mr-4 file:py-1 file:px-3
                 file:rounded-md file:border-0 file:text-sm file:font-semibold
                 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
      multiple={false}
      onChange={(e) => {
        const file = e.target.files?.[0] || null;
        if (file && file.size > MAX_GUIDE_SIZE_BYTES) {
          toast({
            title: "File too large",
            description: `Guide must be less than ${MAX_GUIDE_SIZE_MB} MB.`,
            variant: "destructive"
          });
          e.target.value = ""; // Reset input
          setGuideFile(null);
          return;
        }
        setGuideFile(file);
      }}
      disabled={guideUploading}
    />

    {isEditing && productId ? (
      <Button
        type="button"
        size="sm"
        variant="default"
        disabled={!guideFile || guideUploading}
        onClick={() => handleGuideUpload(productId)}
      >
        {guideUploading ? "Uploading..." : "Upload"}
      </Button>
    ) : (
      <span className="text-xs text-gray-400">
        Guide will be uploaded after product is created
      </span>
    )}
  </div>

  {guideFile && (
    <span className="text-xs text-gray-500">
      Selected: <span className="font-medium">{guideFile.name}</span>
    </span>
  )}

  {guideUrl && (
    <a
      href={guideUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-500 underline"
    >
      View Existing Guide
    </a>
  )}
</div>



        <div className="pt-4">
          <h3 className="text-lg font-medium mb-3">Variants</h3>
          {variantList.length > 0 ? (
            <div className="space-y-3">
              {variantList.map((variant, index) => (
                <div key={index} className="border p-3 rounded-md bg-gray-50 text-black space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-black">
                        {variant.size} / {variant.color} - {variant.price} Da
                        {variant.sale_price > 0 && ` (Sale: ${variant.sale_price} Da)`} | Stock: {variant.stock}
                      </p>
                      {variant.id && <p className="text-xs text-gray-500">ID: {variant.id}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditVariant(index)}
                      >
                        <Edit className="h-4 w-4 text-black" />
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
            onClick={() => {
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
              setVariantDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>



      </div>

      <DialogFooter className="pt-4 border-t">
        <Button onClick={handleSubmit} disabled={loading}>
          {isEditing ? "Update Product" : "Save Product"}
        </Button>
      </DialogFooter>

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
    </DialogContent>
  )
}