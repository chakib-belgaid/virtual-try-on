import React, { useState, useCallback, useRef } from 'react';
import { UploadedImage } from '../types';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (image: UploadedImage | null) => void;
}

const fileToUploadedImage = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const [header, data] = result.split(',');
        if (!header || !data) {
          return reject(new Error('Invalid file format'));
        }
        const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        resolve({
          base64: data,
          mimeType,
          previewUrl: result,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = (error) => reject(error);
      img.src = result;
    };
    reader.onerror = error => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageData = await fileToUploadedImage(file);
        setPreview(imageData.previewUrl);
        setFileName(file.name);
        onImageUpload(imageData);
      } catch (error) {
        console.error("Error processing file:", error);
        onImageUpload(null);
        setPreview(null);
        setFileName(null);
      }
    }
  }, [onImageUpload]);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-xl font-semibold text-gray-300 mb-3">{title}</h3>
      <div
        onClick={handleAreaClick}
        className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors bg-gray-800/50 hover:border-indigo-500 hover:bg-gray-800"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center">
            <UploadIcon className="w-12 h-12 mb-2" />
            <span className="font-semibold">Click to upload</span>
            <span className="text-sm">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>
      {fileName && <p className="text-sm text-gray-500 mt-2 truncate max-w-full">{fileName}</p>}
    </div>
  );
};
