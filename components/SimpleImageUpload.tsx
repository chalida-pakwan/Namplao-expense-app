'use client'

import { useState } from 'react'

interface ImageUploadProps {
  images?: string[]
  onImagesChange?: (images: string[]) => void
  onImagesUploaded?: (imageUrls: string[]) => void
  existingImages?: string[]
  maxImages?: number
}

export default function ImageUpload({ 
  images = [], 
  onImagesChange, 
  onImagesUploaded,
  existingImages = [],
  maxImages = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [localImages, setLocalImages] = useState<string[]>(existingImages)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImageUrls: string[] = []

    try {
      for (let i = 0; i < files.length && i < maxImages; i++) {
        const file = files[i]
        
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file)
        newImageUrls.push(previewUrl)
      }

      const updatedImages = [...localImages, ...newImageUrls].slice(0, maxImages)
      setLocalImages(updatedImages)
      
      if (onImagesChange) {
        onImagesChange(updatedImages)
      }
      
      if (onImagesUploaded) {
        onImagesUploaded(updatedImages)
      }
    } catch (error) {
      console.error('Error handling images:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = localImages.filter((_, i) => i !== index)
    setLocalImages(updatedImages)
    
    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📷 รูปภาพรถ (ทางเลือก)
        </label>
        
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">คลิกเพื่ือเลือกรูป</span> หรือลากไฟล์มาวาง
              </p>
              <p className="text-xs text-gray-500">PNG, JPG หรือ WebP (ไม่เกิน 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
        
        {uploading && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center text-sm text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              กำลังประมวลผลรูปภาพ...
            </div>
          </div>
        )}
      </div>

      {/* Preview Images */}
      {localImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">รูปภาพที่เลือก:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {localImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`รูปภาพ ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {localImages.length} / {maxImages} รูป
          </p>
        </div>
      )}
    </div>
  )
}
