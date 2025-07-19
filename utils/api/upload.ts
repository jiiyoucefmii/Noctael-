import axios from 'axios'
import { API_URL } from './config'

export interface UploadedImage {
  id: string
  variant_id: string
  image_url: string
}

export interface UploadResponse {
  message: string
  uploaded_images: UploadedImage[]
  all_images: UploadedImage[]
  variant_id: string
  product_id: string
  product_name: string
}

export interface GetImagesResponse {
  variant_id: string
  images: UploadedImage[]
  count: number
}

export interface GuideUploadResponse {
  message: string
  guide_url: string
  product_id: string
  product_name: string
}

// Upload variant images
export const uploadVariantImages = async (variantId: string, images: File[]) => {
  for (const image of images) {
    const formData = new FormData()
    formData.append("image", image)

    await axios.post(`${API_URL}/uploads/variant/${variantId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
}

// Get all images for a variant
export const getVariantImages = async (variantId: string): Promise<GetImagesResponse> => {
  const response = await axios.get<GetImagesResponse>(`${API_URL}/uploads/variant/${variantId}/images`, {
    withCredentials: true,
  })
  return response.data
}

// Delete image by ID
export const deleteImage = async (imageId: string): Promise<{ message: string; deleted_image: UploadedImage }> => {
  const response = await axios.delete(`${API_URL}/uploads/image/${imageId}`, {
    withCredentials: true,
  })
  return response.data
}

// ✅ Upload product guide (PDF)
export const uploadProductGuide = async (productId: string, guide: File): Promise<GuideUploadResponse> => {
  const formData = new FormData()
  formData.append("guide", guide)

  const response = await axios.post<GuideUploadResponse>(
    `${API_URL}/uploads/products/${productId}/guide`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  )

  return response.data
}
