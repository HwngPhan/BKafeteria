'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useUploadImage } from '@/hooks/useUploadImage'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onFileChange?: (file: File | null) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  onFileChange,
  disabled,
  className 
}: ImageUploadProps) {
  const { uploadImage, isUploading } = useUploadImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // If onFileChange is provided, we use manual mode
    if (onFileChange) {
      // Create temporary blob link for preview
      const blobUrl = URL.createObjectURL(file)
      onChange(blobUrl)
      onFileChange(file)
    } else {
      // Fallback to auto-upload mode
      const url = await uploadImage(file)
      if (url) {
        onChange(url)
      }
    }
    
    // Clear the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    // If it was a blob URL, we should ideally revoke it, 
    // but onChange('') might be enough if the parent handles it.
    // However, let's keep it simple for now as per user request.
    onChange('')
    if (onFileChange) {
      onFileChange(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center", className)}>
      <div className="w-full h-full">
        {value ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner group">
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                onClick={removeImage}
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full shadow-lg"
              >
                <X size={16} />
              </Button>
            </div>
            <Image
              fill
              src={value}
              alt="Preview"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ) : (
          <div 
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              "w-full h-full rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "cursor-wait"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                  <ImagePlus className="h-7 w-7" />
                </div>
                <div className="text-center px-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Chọn ảnh</span>
                  <span className="text-[8px] text-muted-foreground/60 font-medium italic block">Tối đa 5MB</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        disabled={disabled || isUploading}
        className="hidden"
      />
      
      <p className="text-[10px] text-muted-foreground font-medium italic">
        Định dạng hỗ trợ: JPG, PNG, WebP. Tối đa 5MB.
      </p>
    </div>
  )
}
