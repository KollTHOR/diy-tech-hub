// src/hooks/use-image-upload.ts
import { useState } from "react";

export function useImageUpload(initialImage?: string) {
  const [imagePreview, setImagePreview] = useState<string>(initialImage || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
  };

  return {
    imagePreview,
    isUploading,
    handleImageUpload,
    removeImage,
    setImagePreview,
  };
}
