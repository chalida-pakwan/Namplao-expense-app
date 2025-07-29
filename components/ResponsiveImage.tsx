'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  width?: number
  height?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  width,
  height,
  placeholder = 'empty',
  blurDataURL
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-orange-100 text-orange-600 ${className}`}>
        <div className="text-center p-4">
          <span className="text-2xl mb-2 block">🖼️</span>
          <p className="text-sm">ไม่สามารถโหลดรูปภาพได้</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-orange-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width: width!, height: height! })}
        sizes={sizes}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
    </div>
  )
}
