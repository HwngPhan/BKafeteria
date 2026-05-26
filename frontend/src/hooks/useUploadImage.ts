import { useState } from 'react';
import { toast } from 'sonner';
import { uploadImageAction } from '@/lib/upload';
import { useLanguage } from '@/providers/LanguageProvider';

export function useUploadImage() {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('upload.error_not_image'));
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('upload.error_too_large'));
      return null;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadImageAction(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.url;
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error(t('upload.error_failed'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}
