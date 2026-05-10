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
  disabled?: boolean
  className?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled,
  className 
}: ImageUploadProps) {
  const { uploadImage, isUploading } = useUploadImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadImage(file)
    if (url) {
      onChange(url)
    }
    
    // Clear the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-4 w-full flex flex-col items-center justify-center", className)}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-secondary/20 shadow-inner group">
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
              className="object-cover"
            />
          </div>
        ) : (
          <div 
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              "w-40 h-40 rounded-2xl border-2 border-dashed border-secondary/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-secondary/5 hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "cursor-wait"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chọn ảnh</span>
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
