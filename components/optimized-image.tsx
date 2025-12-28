"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  fill?: boolean
  priority?: boolean
  sizes?: string
  onError?: () => void
  onClick?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  style,
  fill = false,
  priority = false,
  sizes,
  onError,
  onClick,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // If image fails to load, show placeholder
  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' x='50%25' y='50%25' text-anchor='middle'%3EImage%3C/text%3E%3C/svg%3E")
      onError?.()
    }
  }

  // For external images or when we need fallback
  if (!src || src.startsWith("data:") || hasError) {
    return (
   ""
    )
  }

  try {
    // Use Next.js Image for optimization
    if (fill) {
      return (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={className}
          style={style}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          onError={handleError}
          quality={85}
          loading={priority ? "eager" : "lazy"}
          onClick={onClick}
        />
      )
    }

    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 300}
        height={height || 300}
        className={className}
        style={style}
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        onError={handleError}
        quality={85}
        loading={priority ? "eager" : "lazy"}
        onClick={onClick}
      />
    )
  } catch {
    // Fallback to regular img if Image component fails
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onClick={onClick}
      />
    )
  }
}


