"use client";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export const UploadImage = ({ onImageUpload }: {
  onImageUpload: (imageUrl: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Basic validation
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('File size must be less than 5MB');
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setError(null);
        setPendingImages(prev => [...prev, ...validFiles]);
      }
    }
  }

  async function handleUpload() {
    if (pendingImages.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of pendingImages) {
        const response = await axios.get(`/api/user/presignedUrl`);
        const presignedUrl = response.data.presignedUrl;

        const formData = new FormData();
        formData.set("bucket", response.data.fields["bucket"]);
        formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
        formData.set("X-Amz-Credential", response.data.fields["X-Amz-Credential"]);
        formData.set("X-Amz-Date", response.data.fields["X-Amz-Date"]);
        formData.set("key", response.data.fields["key"]);
        formData.set("Policy", response.data.fields["Policy"]);
        formData.set("X-Amz-Signature", response.data.fields["X-Amz-Signature"]);
        formData.set("X-Amz-Security-Token", response.data.fields["X-Amz-Security-Token"]);
        formData.set("Content-Type", file.type);
        formData.append("file", file);

        await axios.post(presignedUrl, formData);

        const imageUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${response.data.fields["key"]}`;
        onImageUpload(imageUrl);
        setUploadedImages(prev => [...prev, imageUrl]);
      }
      setPendingImages([]);
    } catch (e) {
      console.error(e);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            {uploadedImages.length} Uploaded
          </div>
          {pendingImages.length > 0 && (
            <div className="text-xs font-medium text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30">
              {pendingImages.length} Pending
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Upload Button */}
        <label className="relative group cursor-pointer aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-200">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium text-zinc-400 group-hover:text-white">Add Image</span>
          <input
            type="file"
            className="hidden"
            onChange={onFileSelect}
            multiple
            accept="image/*"
          />
        </label>

        {/* Uploaded Images */}
        {uploadedImages.map((url, i) => (
          <div key={`uploaded-${i}`} className="relative aspect-square group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded
              </div>
            </div>
          </div>
        ))}

        {/* Pending Images */}
        {pendingImages.map((file, i) => (
          <div key={`pending-${i}`} className="relative aspect-square group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 opacity-75">
            <img src={URL.createObjectURL(file)} alt="Pending" className="w-full h-full object-cover" />
            <button
              onClick={() => removePendingImage(i)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate backdrop-blur-sm">
                {file.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status & Actions */}
      {pendingImages.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{pendingImages.length} images ready to upload</p>
              <p className="text-xs text-zinc-400">Click upload to process these files</p>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            isLoading={uploading}
            size="sm"
          >
            Upload All
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
