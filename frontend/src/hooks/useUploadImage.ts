import { useState } from 'react';
import { toast } from 'sonner';
import { uploadImageAction } from '@/lib/upload';

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
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

      toast.success('Tải ảnh lên thành công');
      return result.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}
