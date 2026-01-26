'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { SpinnerIcon, CloudUploadIcon, ImageIcon, CloseIcon } from './icons';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  labels: {
    dropzone: string;
    dropzoneHint: string;
    uploading: string;
    removeImage: string;
    dragActive: string;
  };
}

const deleteFromCloudinary = async (url: string) => {
  if (!url.includes('res.cloudinary.com')) return;
  try {
    await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Silent fail - don't block UX for cleanup
  }
};

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  labels,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const uploadFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or HEIC image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Delete old image if replacing
      if (value) await deleteFromCloudinary(value);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onChange(data.url);
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    // Don't delete from Cloudinary here - only clear the form value
    // Deletion happens only when replacing with a new image
    onChange('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [disabled, isUploading]
  );

  const handleClick = () => {
    if (!disabled && !isUploading) fileInputRef.current?.click();
  };

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
        <Image
          src={value}
          alt="Event image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        {!disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-500/80 rounded-full text-white transition-colors"
            title={labels.removeImage}
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          w-full aspect-video rounded-lg border-2 border-dashed transition-all
          flex flex-col items-center justify-center gap-3
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragging
            ? 'border-[#E4DD3B] bg-[#E4DD3B]/10'
            : 'border-white/20 hover:border-[#E4DD3B]/50 bg-white/5 hover:bg-white/10'
          }
        `}
      >
        {isUploading ? (
          <>
            <SpinnerIcon size={40} className="animate-spin text-[#E4DD3B]" />
            <p className="text-white/70 text-sm">{labels.uploading}</p>
          </>
        ) : isDragging ? (
          <>
            <CloudUploadIcon size={40} className="text-[#E4DD3B]" />
            <p className="text-[#E4DD3B] font-medium">{labels.dragActive}</p>
          </>
        ) : (
          <>
            <ImageIcon size={40} className="text-white/40" />
            <div className="text-center">
              <p className="text-white/70 text-sm">{labels.dropzone}</p>
              <p className="text-white/40 text-xs mt-1">{labels.dropzoneHint}</p>
            </div>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </>
  );
}
