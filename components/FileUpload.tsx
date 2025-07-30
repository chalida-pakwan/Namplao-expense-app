'use client'

import { useState, useRef } from 'react'
import supabase from '@/lib/supabaseClient'

interface FileUploadProps {
  onFileUploaded?: (filePath: string, fileUrl: string) => void
  allowedTypes?: string[]
  maxSize?: number // in MB
  multiple?: boolean
  folder?: string
}

export default function FileUpload({ 
  onFileUploaded, 
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 10,
  multiple = false,
  folder = 'uploads'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, url: string, path: string}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`ไฟล์ใหญ่เกินไป (สูงสุด ${maxSize}MB)`)
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      const uploadedFile = {
        name: file.name,
        url: publicUrl,
        path: filePath
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
      
      if (onFileUploaded) {
        onFileUploaded(filePath, publicUrl)
      }

      return uploadedFile
    } catch (error: any) {
      console.error('Error uploading file:', error)
      alert(`เกิดข้อผิดพลาด: ${error.message}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    if (multiple) {
      // Upload multiple files
      for (const file of fileArray) {
        await uploadFile(file)
      }
    } else {
      // Upload single file
      await uploadFile(fileArray[0])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const deleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath])

      if (error) throw error

      setUploadedFiles(prev => prev.filter(file => file.path !== filePath))
    } catch (error: any) {
      console.error('Error deleting file:', error)
      alert(`เกิดข้อผิดพลาดในการลบไฟล์: ${error.message}`)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      default:
        return '📎'
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          multiple={multiple}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-2 mx-auto text-gray-600 hover:text-orange-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span>กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <div className="text-3xl">📁</div>
              <span>คลิกเพื่อเลือกไฟล์</span>
              <span className="text-sm text-gray-400">
                รองรับ: {allowedTypes.join(', ')} (สูงสุด {maxSize}MB)
              </span>
            </>
          )}
        </button>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">ไฟล์ที่อัปโหลด:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                <div>
                  <div className="font-medium text-gray-800">{file.name}</div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ดูไฟล์
                  </a>
                </div>
              </div>
              <button
                onClick={() => deleteFile(file.path)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title="ลบไฟล์"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Component for displaying uploaded files
export function FileList({ files }: { files: Array<{name: string, url: string}> }) {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      default:
        return '📎'
    }
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-800">ไฟล์แนบ:</h4>
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
          <span className="text-lg">{getFileIcon(file.name)}</span>
          <a 
            href={file.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {file.name}
          </a>
        </div>
      ))}
    </div>
  )
}
