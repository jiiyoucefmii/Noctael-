
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

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
  

export const uploadVariantImages = async (variantId: string, images: File[]) => {
for (const image of images) {
    const formData = new FormData()
    formData.append("image", image) 

    await axios.post(`${API_URL}/uploads/variant/${variantId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    })
}
}

export const getVariantImages = async (variantId: string): Promise<GetImagesResponse> => {
  const response = await axios.get<GetImagesResponse>(`${API_URL}/uploads/variant/${variantId}/images`, {
    withCredentials: true,
  })
  return response.data
}

export const deleteImage = async (imageId: string): Promise<{ message: string; deleted_image: UploadedImage }> => {
  const response = await axios.delete(`${API_URL}/uploads/image/${imageId}`, {
    withCredentials: true,
  })
  return response.data
}
