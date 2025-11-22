"use client";
import { useRef, useState, useEffect } from "react";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import axios from "axios";
import { CLOUDFRONT_URL } from "@/utils/clientConstants";
import { Button } from "@/components/ui/Button";
import { getToken } from "@/utils/auth";

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
  const { refetch } = usePresignedUrl();

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
          "x-user-id": getToken("user") ?? "",
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


        console.log(data.url, formData)
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Upload Images</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Add up to {MAX_IMAGES} images for your task
          </p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded-full">
          <p className="text-xs font-medium text-zinc-300">
            {uploadedImages.length} / {MAX_IMAGES} Uploaded
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Uploaded Images */}
          {uploadedImages.map((image, index) => (
            <div key={`uploaded-${index}-${image.key}`} className="relative group aspect-square">
              <div className="w-full h-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-75 group-hover:opacity-100"
                />
              </div>
              <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                Uploaded
              </div>
              <button
                onClick={() => removeUploadedImage(index)}
                className="absolute top-2 right-2 bg-zinc-900/80 hover:bg-red-500/90 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm border border-zinc-700 hover:border-red-500"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {/* Pending Images */}
          {pendingImages.map((image, index) => (
            <div key={`pending-${index}-${image.previewUrl}`} className="relative group aspect-square">
              <div className="w-full h-full overflow-hidden rounded-xl border border-amber-500/30 bg-zinc-900">
                <img
                  src={image.previewUrl}
                  alt={`Pending ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                Pending
              </div>
              <button
                onClick={() => removePendingImage(index)}
                className="absolute top-2 right-2 bg-zinc-900/80 hover:bg-red-500/90 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm border border-zinc-700 hover:border-red-500"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      {canAddMore && (
        <label className="block w-full cursor-pointer group">
          <div className="relative border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 transition-all duration-200 bg-zinc-900/30 hover:bg-zinc-900/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <svg className="w-6 h-6 text-zinc-400 group-hover:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  Click to upload
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  PNG, JPG up to 10MB
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
      )}

      {/* Upload Button */}
      {pendingImages.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={uploadAllImages}
            isLoading={uploading}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading...' : `Upload ${pendingImages.length} Image${pendingImages.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}
