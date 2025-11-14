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

  // Notify parent component when uploaded images change
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
    
    // Create preview URLs for selected files
    const newPendingImages: PendingImage[] = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    setPendingImages(prev => [...prev, ...newPendingImages]);
    
    // Clear the input
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const newPending = [...prev];
      const removed = newPending.splice(index, 1)[0];
      // Clean up the object URL
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
      
      // Clean up preview URLs
      pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      
      // Move pending to uploaded
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
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Upload Images</h1>
      
      {/* Image Grid */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {/* Uploaded Images */}
          {uploadedImages.map((image, index) => (
            <div key={`uploaded-${index}-${image.key}`} className="relative group">
              <img
                src={image.url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg border-2 border-green-500"
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Uploaded
              </div>
              <button
                onClick={() => removeUploadedImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Pending Images */}
          {pendingImages.map((image, index) => (
            <div key={`pending-${index}-${image.previewUrl}`} className="relative group">
              <img
                src={image.previewUrl}
                alt={`Pending ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg border-2 border-yellow-500"
              />
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Pending
              </div>
              <button
                onClick={() => removePendingImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-600">
        {uploadedImages.length} uploaded, {pendingImages.length} pending / {MAX_IMAGES} total
      </div>

      {/* Upload Section */}
      {canAddMore && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-8 rounded-lg border-2 border-dashed border-gray-300 transition-colors">
              <div className="text-4xl text-gray-400">+</div>
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
            <p className="text-sm text-gray-500">
              Click to select images (max {MAX_IMAGES - totalImages} more)
            </p>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          )}
        </div>
      )}

      {/* Upload Button */}
      {pendingImages.length > 0 && (
        <button
          onClick={uploadAllImages}
          disabled={uploading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Uploading..." : `Upload ${pendingImages.length} Image${pendingImages.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
