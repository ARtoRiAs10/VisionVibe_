'use client';

import { useState, useRef } from 'react';
import { UploadIcon } from './icons';
import { Button } from './ui/button';
import { ImageFile } from '@/types';

interface ImageUploaderProps {
  onImageSelect: (file: ImageFile) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setFileName(file.name);

      const base64Data = base64.split(',')[1];
      onImageSelect({
        base64: base64Data,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full p-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition"
      >
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Change Image
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <UploadIcon />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Upload your room image
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                JPG, PNG or WebP up to 5MB
              </p>
            </div>
          </div>
        )}

        {/* FIXED onChange handler */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>
    </div>
  );
}
