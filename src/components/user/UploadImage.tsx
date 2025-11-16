"use client";
import { useRef, useState, useEffect } from "react";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import axios from "axios";
import { CLOUDFRONT_URL } from "@/utils/clientConstants";

const MAX_IMAGES = 5;

interface PendingImage {
  file: File;
  previewUrl: string;
}

interface UploadedImage {
  key: string;
  url: string;
}

interface UploadImageProps {
  onImagesChange?: (images: UploadedImage[]) => void;
}

export default function UploadImage({ onImagesChange }: UploadImageProps) {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { refetch, error } = usePresignedUrl();

  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(uploadedImages);
    }
  }, [uploadedImages, onImagesChange]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = pendingImages.length + uploadedImages.length;
    const remainingSlots = MAX_IMAGES - totalImages;
    
    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s). Maximum is ${MAX_IMAGES} images.`);
      return;
    }
    
    if (files.length === 0) {
      return;
    }
    
    const newPendingImages: PendingImage[] = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    setPendingImages(prev => [...prev, ...newPendingImages]);
    
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const newPending = [...prev];
      const removed = newPending.splice(index, 1)[0];
      URL.revokeObjectURL(removed.previewUrl);
      return newPending;
    });
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAllImages = async () => {
    if (pendingImages.length === 0) {
      return;
    }
    
    setUploading(true);
    try {
      const uploadedKeys: UploadedImage[] = [];
      
      for (const pendingImage of pendingImages) {
        const data = await refetch({
          "x-file-type": pendingImage.file.type,
        });
        
        if (!data) {
          throw new Error("Failed to get presigned URL");
        }

        const formData = new FormData();
        
        if (data.fields.bucket) {
          formData.set("bucket", data.fields.bucket);
        }
        if (data.fields["X-Amz-Algorithm"]) {
          formData.set("X-Amz-Algorithm", data.fields["X-Amz-Algorithm"]);
        }
        if (data.fields["X-Amz-Credential"]) {
          formData.set("X-Amz-Credential", data.fields["X-Amz-Credential"]);
        }
        if (data.fields["X-Amz-Date"]) {
          formData.set("X-Amz-Date", data.fields["X-Amz-Date"]);
        }
        if (data.fields.key) {
          formData.set("key", data.fields.key);
        }
        if (data.fields.Policy) {
          formData.set("Policy", data.fields.Policy);
        }
        if (data.fields["X-Amz-Signature"]) {
          formData.set("X-Amz-Signature", data.fields["X-Amz-Signature"]);
        }
        formData.append("Content-Type", pendingImage.file.type);
        formData.append("file", pendingImage.file);
        
        await axios.post(data.url, formData);
        
        if (data.fields.key) {
          uploadedKeys.push({
            key: data.fields.key,
            url: `${CLOUDFRONT_URL}${data.fields.key}`
          });
        }
        
        console.log("File uploaded successfully!", data.fields);
      }
      
      pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      
      setUploadedImages(prev => [...prev, ...uploadedKeys]);
      setPendingImages([]);
      
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const totalImages = pendingImages.length + uploadedImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Images</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload up to {MAX_IMAGES} images for your task
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <p className="text-sm font-semibold text-blue-700">
            {uploadedImages.length} / {MAX_IMAGES}
          </p>
          <p className="text-xs text-blue-600">Uploaded</p>
        </div>
      </div>
      
      {/* Image Grid */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {/* Uploaded Images */}
          {uploadedImages.map((image, index) => (
            <div key={`uploaded-${index}-${image.key}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-xl border-2 border-green-400 bg-gray-50">
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-md">
                ✓ Uploaded
              </div>
              <button
                onClick={() => removeUploadedImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Pending Images */}
          {pendingImages.map((image, index) => (
            <div key={`pending-${index}-${image.previewUrl}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-xl border-2 border-yellow-400 bg-gray-50">
                <img
                  src={image.previewUrl}
                  alt={`Pending ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-md">
                ⏳ Pending
              </div>
              <button
                onClick={() => removePendingImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status Message */}
      {totalImages > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-green-600">{uploadedImages.length}</span> uploaded, 
              <span className="font-semibold text-yellow-600 ml-1">{pendingImages.length}</span> pending
            </span>
            <span className="text-gray-500">
              {MAX_IMAGES - totalImages} slot{MAX_IMAGES - totalImages !== 1 ? 's' : ''} remaining
            </span>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {canAddMore && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <label className="cursor-pointer w-full group">
            <div className="border-2 border-dashed border-gray-300 group-hover:border-blue-400 rounded-xl p-12 transition-all bg-gradient-to-br from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-purple-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500">
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, GIF up to 10MB (max {MAX_IMAGES - totalImages} more)
                  </p>
                </div>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={onFileSelect}
              accept="image/*"
              disabled={uploading}
            />
          </label>
          
          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">
                ⚠️ Error: {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {pendingImages.length > 0 && (
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <button
            onClick={uploadAllImages}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading {pendingImages.length} image{pendingImages.length > 1 ? 's' : ''}...
              </span>
            ) : (
              `📤 Upload ${pendingImages.length} Image${pendingImages.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
