'use client'

import { useState } from 'react'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

interface ExpenseReceiptUploadProps {
  onFileUploaded: (filePath: string, fileUrl: string) => void
  currentFileUrl?: string
  maxSize?: number // MB
  accept?: string
  className?: string
}

export default function ExpenseReceiptUpload({ 
  onFileUploaded, 
  currentFileUrl, 
  maxSize = 5,
  accept = 'image/*,.pdf',
  className = ''
}: ExpenseReceiptUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const supabase = createClientComponentClient()

  const uploadFile = async (file: File) => {
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`ไฟล์ใหญ่เกินไป (ขนาดสูงสุด ${maxSize}MB)`)
      return
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim())
    const isValidType = allowedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type)
      return file.type === type
    })

    if (!isValidType) {
      toast.error('ประเภทไฟล์ไม่ถูกต้อง (รองรับ รูปภาพ และ PDF)')
      return
    }

    setUploading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('กรุณาเข้าสู่ระบบก่อน')
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `expense-receipt-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `expense-receipts/${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        })

      if (error) {
        console.error('Upload error:', error)
        toast.error('เกิดข้อผิดพลาดในการอัปโหลด')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      toast.success('อัปโหลดหลักฐานเรียบร้อยแล้ว')
      onFileUploaded(filePath, publicUrl)

    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeFile = () => {
    onFileUploaded('', '')
  }

  const openFile = () => {
    if (currentFileUrl) {
      window.open(currentFileUrl, '_blank')
    }
  }

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) {
      return <File className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-blue-500" />
  }

  const getFileName = (url: string) => {
    const parts = url.split('/')
    return parts[parts.length - 1] || 'ไฟล์หลักฐาน'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          📎 หลักฐานสลิป/ใบเสร็จ
        </label>
        <span className="text-xs text-gray-500">
          (รูปภาพ หรือ PDF, ขนาดสูงสุด {maxSize}MB)
        </span>
      </div>

      {currentFileUrl ? (
        /* แสดงไฟล์ที่อัปโหลดแล้ว */
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {getFileIcon(currentFileUrl)}
            <div>
              <div className="text-sm font-medium text-green-800">
                {getFileName(currentFileUrl)}
              </div>
              <div className="text-xs text-green-600">อัปโหลดเรียบร้อยแล้ว</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={openFile}
              className="p-1 text-green-600 hover:text-green-700"
              title="ดูไฟล์"
            >
              <File className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-red-600 hover:text-red-700"
              title="ลบไฟล์"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* พื้นที่อัปโหลด */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="space-y-3">
            {uploading ? (
              <>
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600">กำลังอัปโหลด...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">คลิกเพื่อเลือกไฟล์</span>
                    {' '}หรือลากไฟล์มาวาง
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    รองรับ: รูปภาพ (JPG, PNG, WEBP) และ PDF
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* คำแนะนำ */}
      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">💡 เคล็ดลับ:</p>
          <ul className="space-y-1">
            <li>• ถ่ายรูปสลิปให้ชัดเจน อ่านตัวอักษรได้</li>
            <li>• สแกน PDF หากมีใบเสร็จแบบกระดาษ</li>
            <li>• เก็บไฟล์เพื่อความโปร่งใสในการจัดการ</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
